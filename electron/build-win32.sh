#!/bin/bash

. "./build.sh"

function rcedit {
  ./rcedit.exe "build/$1/hakuneko.exe" \
    --set-version-string "ProductName" "HakuNeko S" \
    --set-version-string "CompanyName" "" \
    --set-version-string "LegalCopyright" "2017" \
    --set-version-string "FileDescription" "HakuNeko S - Desktop Client" \
    --set-version-string "InternalName" "" \
    --set-version-string "OriginalFilename" "hakuneko.exe" \
    --set-file-version "0.0.31" \
    --set-product-version "0.0.31" \
    --set-icon "res/icon.ico"
}

build "win32-x64"
rcedit "win32-x64"
build "win32-ia32"
rcedit "win32-ia32"