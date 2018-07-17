'use strict';

var fs = require('fs');
var path = require('path');

module.exports = function findBinary(packageJsonPath) {
  var pack = JSON.parse(fs.readFileSync(packageJsonPath));

  // Certain ABI versions are Electron-only.
  // https://github.com/electron/electron/issues/5851
  var nodeAbi;
  switch (process.versions.modules) {
    case '49':
      nodeAbi = 'electron-v1.3';
      break;
    case '50':
      nodeAbi = 'electron-v1.4';
      break;
    case '53':
      nodeAbi = 'electron-v1.6';
      break;
    case '54':
      nodeAbi = 'electron-v1.7';
      break;
    case '57':
      // On Windows, we still need a custom build for Electron.
      // On other platforms, the same build works on both.
      if (process.platform === 'win32' && process.versions.electron) {
        nodeAbi = 'electron-v2.0';
        break;
      }
      // intentional fallthrough
    default:
      nodeAbi = 'node-v' + process.versions.modules;
  }

  var modulePath = pack.binary.module_path
    .replace('{module_name}', pack.binary.module_name)
    .replace('{node_abi}', nodeAbi)
    .replace('{platform}', process.platform)
    .replace('{arch}', process.arch);

  var resolvedPath = path.join(
    path.dirname(packageJsonPath),
    modulePath,
    pack.binary.module_name + '.node'
  );

  return resolvedPath;
};
