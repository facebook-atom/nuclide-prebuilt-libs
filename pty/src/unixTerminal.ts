/**
 * Copyright (c) 2012-2015, Christopher Jeffrey (MIT License)
 * Copyright (c) 2016, Daniel Imms (MIT License).
 * Copyright (c) 2018, Microsoft Corporation (MIT License).
 */

import * as net from 'net';
import * as path from 'path';
import * as tty from 'tty';
import { Terminal } from './terminal';
import { ProcessEnv, IPtyForkOptions, IPtyOpenOptions } from './interfaces';
import { ArgvOrCommandLine } from './types';
import { assign } from './utils';

const findBinary = require('../../find-binary');
const pty = require(findBinary(require.resolve('../package.json')));

const DEFAULT_FILE = 'sh';
const DEFAULT_NAME = 'xterm';

export class UnixTerminal extends Terminal {
  protected pid: number;
  protected fd: number;
  protected pty: string;

  protected file: string;
  protected name: string;

  protected readable: boolean;
  protected writable: boolean;

  private _boundClose: boolean;
  private _emittedClose: boolean;
  private master: any;
  private slave: any;

  constructor(file?: string, args?: ArgvOrCommandLine, opt?: IPtyForkOptions) {
    super();

    if (typeof args === 'string') {
      throw new Error('args as a string is not supported on unix.');
    }

    // Initialize arguments
    args = args || [];
    file = file || DEFAULT_FILE;
    opt = opt || {};
    opt.env = opt.env || process.env;

    const cols = opt.cols || Terminal.DEFAULT_COLS;
    const rows = opt.rows || Terminal.DEFAULT_ROWS;
    const uid = opt.uid || -1;
    const gid = opt.gid || -1;
    const env = assign({}, opt.env);

    if (opt.env === process.env) {
      this._sanitizeEnv(env);
    }

    const cwd = opt.cwd || process.cwd();
    const name = opt.name || env.TERM || DEFAULT_NAME;
    env.TERM = name;
    const parsedEnv = this._parseEnv(env);

    const onexit = (code: any, signal: any) => {
      // XXX Sometimes a data event is emitted after exit. Wait til socket is
      // destroyed.
      if (!this._emittedClose) {
        if (this._boundClose) return;
        this._boundClose = true;
        this.once('close', () => this.emit('exit', code, signal));
        return;
      }
      this.emit('exit', code, signal);
    };

    // fork
    const term = pty.fork(file, args, parsedEnv, cwd, cols, rows, uid, gid, onexit);

    this.socket = new PipeSocket(term.fd);
    this.socket.setEncoding('utf8');
    this.socket.resume();

    // setup
    this.socket.on('error', (err: any) => {
      // NOTE: fs.ReadStream gets EAGAIN twice at first:
      if (err.code) {
        if (~err.code.indexOf('EAGAIN')) {
          return;
        }
      }

      // close
      this._close();
      // EIO on exit from fs.ReadStream:
      if (!this._emittedClose) {
        this._emittedClose = true;
        this.emit('close');
      }

      // EIO, happens when someone closes our child process: the only process in
      // the terminal.
      // node < 0.6.14: errno 5
      // node >= 0.6.14: read EIO
      if (err.code) {
        if (~err.code.indexOf('errno 5') || ~err.code.indexOf('EIO')) {
          return;
        }
      }

      // throw anything else
      if (this.listeners('error').length < 2) {
        throw err;
      }
    });

    this.pid = term.pid;
    this.fd = term.fd;
    this.pty = term.pty;

    this.file = file;
    this.name = name;

    this.readable = true;
    this.writable = true;

    this.socket.on('close', () => {
      if (this._emittedClose) {
        return;
      }
      this._emittedClose = true;
      this._close();
      this.emit('close');
    });
  }

  /**
   * openpty
   */

  public static open(opt: IPtyOpenOptions): UnixTerminal {
    const self = Object.create(UnixTerminal.prototype);
    opt = opt || {};

    if (arguments.length > 1) {
      opt = {
        cols: arguments[1],
        rows: arguments[2]
      };
    }

    const cols = opt.cols || Terminal.DEFAULT_COLS;
    const rows = opt.rows || Terminal.DEFAULT_ROWS;

    // open
    const term = pty.open(cols, rows);

    self.master = new PipeSocket(term.master);
    self.master.setEncoding('utf8');
    self.master.resume();

    self.slave = new PipeSocket(term.slave);
    self.slave.setEncoding('utf8');
    self.slave.resume();

    // if the slave closes, then we will get close events on both ends
    // of the pty. we will use the master's close event to pass along,
    // but if we don't handle the slave's as well we get an uncaught
    // exception.
    self.slave.on('close', err => {});
    self.slave.on('error', err => {});

    self.socket = self.master;
    self.pid = null;
    self.fd = term.master;
    self.pty = term.pty;

    self.file = process.argv[0] || 'node';
    self.name = process.env.TERM || '';

    self.readable = true;
    self.writable = true;

    self.socket.on('error', err => {
      self._close();
      if (self.listeners('error').length < 2) {
        throw err;
      }
    });

    self.socket.on('close', () => {
      self._close();
    });

    return self;
  };

  public write(data: string): void {
    this.socket.write(data);
  }

  public destroy(): void {
    this._close();

    // Need to close the read stream so node stops reading a dead file
    // descriptor. Then we can safely SIGHUP the shell.
    this.socket.once('close', () => {
      this.kill('SIGHUP');
    });

    this.socket.destroy();
  }

  public kill(signal?: string): void {
    try {
      process.kill(this.pid, signal || 'SIGHUP');
    } catch (e) { /* swallow */ }
  }

  /**
   * Gets the name of the process.
   */
  public get process(): string {
    return pty.process(this.fd, this.pty) || this.file;
  }

  /**
   * Gets the name of the pty
   */
  public get ptyName(): string {
    return this.pty;
  }

  /**
   * TTY
   */

  public resize(cols: number, rows: number): void {
    pty.resize(this.fd, cols, rows);
  }

  private _sanitizeEnv(env: ProcessEnv): void {
      // Make sure we didn't start our server from inside tmux.
      delete env['TMUX'];
      delete env['TMUX_PANE'];

      // Make sure we didn't start our server from inside screen.
      // http://web.mit.edu/gnu/doc/html/screen_20.html
      delete env['STY'];
      delete env['WINDOW'];

      // Delete some variables that might confuse our terminal.
      delete env['WINDOWID'];
      delete env['TERMCAP'];
      delete env['COLUMNS'];
      delete env['LINES'];
  }
}

/**
 * Wraps net.Socket to force the handle type "PIPE" by temporarily overwriting
 * tty_wrap.guessHandleType.
 * See: https://github.com/chjj/pty.js/issues/103
 */
class PipeSocket extends net.Socket {
  constructor(fd: any) {
    if (parseInt(process.versions.modules) < 72) {
      const tty = (<any>process).binding('tty_wrap');
      const guessHandleType = tty.guessHandleType;
      tty.guessHandleType = () => 'PIPE';
      super({ fd });
      tty.guessHandleType = guessHandleType;
    } else {
      // This code is take from here: https://github.com/microsoft/node-pty/blob/master/src/unixTerminal.ts
      const { Pipe, constants } = (<any>process).binding('pipe_wrap'); // tslint:disable-line
      // @types/node has fd as string? https://github.com/DefinitelyTyped/DefinitelyTyped/pull/18275
      const handle = new Pipe(constants.SOCKET);
      handle.open(fd);
      super(<any>{ handle });
    }
  }
}
