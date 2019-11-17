#!/bin/bash
# Copyright (c) Facebook, Inc. and its affiliates. All Rights Reserved.

set -e

if [[ -n "$npm_config_argv" ]]; then
  # See https://github.com/npm/npm/issues/3059
  npm_first_arg=$(node -p 'JSON.parse(process.env.npm_config_argv).original[0]')
  [[ $npm_first_arg != "publish" ]] && exit
fi

VERSION=$(node -p 'require("./package.json").version')
BINARY_HOST_MIRROR="https://github.com/facebooknuclide/nuclide-prebuilt-libs/releases/download/v${VERSION}/"

TARGETS=(
  "--target_platform=linux --runtime=electron --target=1.7.0"
  "--target_platform=linux --runtime=node --target=8.9.3"
  "--target_platform=linux --runtime=electron --target=3.0.13"
  "--target_platform=linux --runtime=electron --target=4.2.9"
  "--target_platform=linux --runtime=node --target=10.13.0"
  "--target_platform=linux --runtime=electron --target=6.0.9"
  "--target_platform=linux --runtime=node --target=12.4.0"

  "--target_platform=darwin --runtime=electron --target=1.7.0"
  "--target_platform=darwin --runtime=node --target=8.9.3"
  "--target_platform=darwin --runtime=electron --target=3.0.13"
  "--target_platform=darwin --runtime=electron --target=4.2.9"
  "--target_platform=darwin --runtime=node --target=10.13.0"
  "--target_platform=darwin --runtime=electron --target=6.0.9"
  "--target_platform=darwin --runtime=node --target=12.4.0"

  "--target_platform=win32 --runtime=electron --target=1.7.0"
  "--target_platform=win32 --runtime=node --target=8.9.3"
  "--target_platform=win32 --runtime=electron --target=3.0.13"
  "--target_platform=win32 --runtime=electron --target=4.2.9"
  "--target_platform=win32 --runtime=node --target=10.13.0"
  "--target_platform=win32 --runtime=electron --target=6.0.9"
  "--target_platform=win32 --runtime=node --target=12.4.0"
)

MODULE_NAMES=(
  "fuzzy-native"
  "keytar"
  "pty"
)

for module_name in "${MODULE_NAMES[@]}"; do
  pushd "$module_name"
    npm install
    for target in "${TARGETS[@]}"; do
      env "npm_config_${module_name}_binary_host_mirror="$BINARY_HOST_MIRROR"" \
        ./node_modules/.bin/node-pre-gyp install $target
    done
  popd
done
