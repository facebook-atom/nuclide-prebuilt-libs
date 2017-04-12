# pty

Fork of [pty.js](https://github.com/chjj/pty.js) prebuilt for Mac and Linux.

## About

`pty` includes prebuilt binaries of [pty.js](https://github.com/chjj/pty.js) for Mac and Linux for major versions of node.js and electron. It is meant for use in [Atom packages](https://atom.io/packages) where your end-user might not have a proper build toolchain.

This module is not meant to be built by the end-user and does not include the necessary files to do so.

This module implements
`forkpty(3)` bindings for node.js. This allows you to fork processes with pseudo
terminal file descriptors. It returns a terminal object which allows reads
and writes.

This is useful for:

- Writing a terminal emulator.
- Getting certain programs to *think* you're a terminal. This is useful if
  you need a program to send you control sequences.

## Example Usage

``` js
var pty = require('nuclide-prebuilt-libs/pty');

var term = pty.spawn('bash', [], {
  name: 'xterm-color',
  cols: 80,
  rows: 30,
  cwd: process.env.HOME,
  env: process.env
});

term.on('data', function(data) {
  console.log(data);
});

term.write('ls\r');
term.resize(100, 40);
term.write('ls /\r');

console.log(term.process);
```

## Todo

- Add tcsetattr(3), tcgetattr(3).
- Add a way of determining the current foreground job for platforms other
  than Linux and OSX/Darwin.

## Contribution and License Agreement

If you contribute code to this project, you are implicitly allowing your code
to be distributed under the MIT license. You are also implicitly verifying that
all code is your original work. `</legalese>`

## License

Copyright (c) 2012-2015, Christopher Jeffrey (MIT License).
Copyright (c) 2017, Michael Marucheck (MIT License).
