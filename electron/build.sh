#!/bin/bash

set -e

cd "$(dirname $0)"

mkdir -p "build"
rm -r -f "build/linux-x64"
unzip "redist/electron-v1.*-linux-x64.zip" -d "build/linux-x64"
rm -f "build/linux-x64/version"
rm -f "build/linux-x64/LICENSE"*
rm -r -f "build/linux-x64/locales"
rm -r -f "build/linux-x64/resources/default_app.asar"
mv "build/linux-x64/electron" "build/linux-x64/hakuneko"
cp -r "src" "build/linux-x64/resources/app"
