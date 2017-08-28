#!/bin/bash

set -e

if [[ -n "$npm_config_argv" ]]; then
  # See https://github.com/npm/npm/issues/3059
  npm_first_arg=$(node -p 'JSON.parse(process.env.npm_config_argv).original[0]')
  [[ $npm_first_arg != "publish" ]] && exit
fi

VERSION=$(node -p 'require("./package.json").version')
BINARY_HOST_MIRROR="https://github.com/facebooknuclide/nuclide-prebuilt-libs/releases/download/v${VERSION}/"

TARGETS=(
  "--target_platform=linux --runtime=electron --target=1.3.6"
  "--target_platform=linux --runtime=electron --target=1.4.16"
  "--target_platform=linux --runtime=electron --target=1.6.5"
  "--target_platform=linux --runtime=node --target=6.0.0"
  "--target_platform=linux --runtime=node --target=7.0.0"

  "--target_platform=darwin --runtime=electron --target=1.3.6"
  "--target_platform=darwin --runtime=electron --target=1.4.16"
  "--target_platform=darwin --runtime=electron --target=1.6.5"
  "--target_platform=darwin --runtime=node --target=6.0.0"
  "--target_platform=darwin --runtime=node --target=7.0.0"
)

MODULE_NAMES=(
  "ctags"
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
