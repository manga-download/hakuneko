#!/bin/bash

PUBLISHER="Ronny Wegener"
PACKAGE="hakuneko-desktop"
PRODUCT="HakuNeko Desktop"
VERSION="0.0.31"
DESCRIPTION_SHORT="Manga Downloader"
DESCRIPTION_LONG=""
YEAR="$(date +%Y)"
URL="http://sourceforge.net/projects/hakuneko"
BIN_WINDOWS="hakuneko.exe"
BIN_DARWIN="hakuneko"
BIN_LINUX="hakuneko"

function build {
    rm -r -f "build/$2"
    mkdir -p "build/$2"
    unzip "redist/electron-v1.*-$1.zip" -d "build/$2"
    rm -f "build/$2/version"
    rm -f "build/$2/LICENSE"*
    rm -r -f "build/$2/locales"
    rm -r -f "build/$2/resources/default_app.asar"
    if [[ $2 =~ linux.* ]]
    then
        mv "build/$2/electron" "build/$2/$BIN_LINUX"
    fi
    if [[ $2 =~ windows.* ]]
    then
        mv "build/$2/electron.exe" "build/$2/$BIN_WINDOWS"
    fi
    cp -r "src" "build/$2/resources/app"
}

function compress {
    cd "build"
    rm -f "$1.zip"
    zip -r "$1.zip" "$1"
    cd ..
}

set -e

cd "$(dirname $0)"
mkdir -p "build"