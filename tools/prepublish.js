'use strict';

if (process.env.npm_config_argv) {
  var npm_argv = JSON.parse(process.env.npm_config_argv);
  if (npm_argv.original[0] !== 'publish') process.exit(0);
}

var rimraf = require('rimraf');
var gyp = require('node-pre-gyp');

rimraf.sync('./build');

var versions = [
  '0.10.0', '0.12.0', '1.0.0', '1.1.0', '2.0.0', '3.0.0', '4.0.0', '5.0.0'
];
var matrix = {
  x64: ['linux', 'darwin'],
};

var targets = [];
Object.keys(matrix).forEach(arch => {
  matrix[arch].forEach(platform => {
    versions.forEach(version => {
      targets.push({
        target: version,
        target_platform: platform,
        target_arch: arch
      });
    });
  });
});

(function next(err) {
  if (err) {
    console.log(err.message);
    process.exit(1);
  }
  if (!targets.length) {
    process.exit(0);
  }
  var target = targets.pop();
  var prog = Object.assign(new gyp.Run(), {opts: target});
  prog.commands.install([], next);
})();
