#!/bin/bash

set -e

cd "$(dirname $0)"

mkdir -p "build"
rm -r -f "build/win32-x64"
unzip "redist/electron-v1.*-win32-x64.zip" -d "build/win32-x64"
rm -f "build/win32-x64/version"
rm -f "build/win32-x64/LICENSE"*
rm -r -f "build/win32-x64/locales"
rm -r -f "build/win32-x64/resources/default_app.asar"
mv "build/win32-x64/electron.exe" "build/win32-x64/hakuneko.exe"
cp -r "src" "build/win32-x64/resources/app"

./rcedit.exe "build/win32-x64/hakuneko.exe" \
  --set-version-string "ProductName" "HakuNeko S" \
  --set-version-string "CompanyName" "" \
  --set-version-string "LegalCopyright" "2017" \
  --set-version-string "FileDescription" "HakuNeko S - Desktop Client" \
  --set-version-string "InternalName" "" \
  --set-version-string "OriginalFilename" "hakuneko.exe" \
  --set-file-version "0.0.28" \
  --set-product-version "0.0.28" \
  --set-icon "res/icon.ico"
  