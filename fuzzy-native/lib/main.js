'use strict';

var findBinary = require('../../find-binary');
var binding_path = findBinary(require.resolve('../package.json'));

const nativeResult = require(binding_path);

console.log('Loading Native Lib!');
console.log('path  = ' + binding_path);
console.log('lib = ' + nativeResult);

module.exports = nativeResult
