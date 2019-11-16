'use strict';

var findBinary = require('../../find-binary');
var binding_path = findBinary(require.resolve('../package.json'));

console.log('Loading Native Lib!');
console.log('path  = ' + binding_path);
let nativeResult;
try {
    nativeResult = require(binding_path);
    console.log('lib = ' + nativeResult);
} catch (e) {
    console.log('failed ', e);
}



module.exports = nativeResult
