# nuclide-prebuilt-libs

[![Build Status](https://travis-ci.org/facebook-atom/nuclide-prebuilt-libs.svg?branch=master)](https://travis-ci.org/facebook-atom/nuclide-prebuilt-libs)
[![AppVeyor](https://ci.appveyor.com/api/projects/status/pnsyi0iqddtpbspc?svg=true)](https://ci.appveyor.com/project/Facebook/nuclide-prebuilt-libs)

This repo exists to build Nuclide's binary dependencies for various architectures.

## Usage in application code

```js
const ctags = require('nuclide-prebuilt-libs/ctags');
const fuzzyNative = require('nuclide-prebuilt-libs/fuzzy-native');
const keytar = require('nuclide-prebuilt-libs/keytar');
const ptyjs = require('nuclide-prebuilt-libs/pty');
```

## Publishing `nuclide-prebuilt-libs`

1. Run `npm version patch`.
2. Push the base package version bump and release tag with `git push --follow-tags`.
3. Wait for both Travis and AppVeyor to build and upload the release artifacts.
4. To test your npm release: Run `./prepublish && npm pack`
5. Run `npm publish`.

## Things to know about sub-packages

* They're _semi_ independent in that you can run `npm install` inside any of them to do work on one of them.
* The empty `.npmignore` in the sub-packages and the `"files"` field in the root package are super important.
* Be careful not to fall into https://github.com/atom/atom/blob/128f661/src/package.coffee#L486-L503.
* The `"dependencies"` in the sub-packages **DO NOT** get installed when someone installs `nuclide-prebuilt-libs`.

## License
`nuclide-prebuilt-libs` is Nuclide licensed, as found in the LICENSE file.
