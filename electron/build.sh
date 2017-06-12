#!/bin/bash

function build {
    rm -r -f "build/$1"
    unzip "redist/electron-v1.*-$1.zip" -d "build/$1"
    rm -f "build/$1/version"
    rm -f "build/$1/LICENSE"*
    rm -r -f "build/$1/locales"
    rm -r -f "build/$1/resources/default_app.asar"
    if [[ $string =~ linux.* ]]
    then
        mv "build/$1/electron" "build/$1/hakuneko"
    fi
    if [[ $string =~ win32.* ]]
    then
        mv "build/$1/electron.exe" "build/$1/hakuneko.exe"
    fi
    cp -r "src" "build/$1/resources/app"
}

set -e

cd "$(dirname $0)"
mkdir -p "build"