'use strict';

var fs = require('fs');
var path = require('path');

module.exports = function findBinary(packageJsonPath) {
  var pack = JSON.parse(fs.readFileSync(packageJsonPath));

  // ABI v49 is only for Electron. https://github.com/electron/electron/issues/5851
  var nodeAbi = process.versions.modules === '49'
    ? 'electron-v1.3'
    : 'node-v' + process.versions.modules;

  var modulePath = pack.binary.module_path
    .replace('{module_name}', pack.binary.module_name)
    .replace('{version}', pack.version)
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
