#!/bin/bash

PUBLISHER="Ronny Wegener <wegener.ronny@gmail.com>"
PACKAGE="hakuneko-desktop"
PRODUCT="HakuNeko Desktop"
VERSION="0.1.0"
DESCRIPTION_SHORT="Manga Downloader"
DESCRIPTION_LONG="Desktop client for HakuNeko S web-based manga downloader."
YEAR="$(date +%Y)"
URL="http://sourceforge.net/projects/hakuneko"
BIN_WINDOWS="hakuneko.exe"
BIN_DARWIN="HakuNeko"
BIN_LINUX="hakuneko"

function build {
    rm -r -f "build/$2"
    mkdir -p "build/$2"
    unzip "redist/electron-v1.*-$1.zip" -d "build/$2"
    rm -f "build/$2/version"
    rm -f "build/$2/LICENSE"*
    if [[ $2 =~ linux.* ]]
    then
        rm -r -f "build/$2/locales"
        rm -r -f "build/$2/resources/default_app.asar"
        #cp -r "src" "build/$2/resources/app"
        asar pack "src" "build/$2/resources/app.asar"
        mv "build/$2/electron" "build/$2/$BIN_LINUX"
    fi
    if [[ $2 =~ windows.* ]]
    then
        rm -r -f "build/$2/locales"
        rm -r -f "build/$2/resources/default_app.asar"
        #cp -r "src" "build/$2/resources/app"
        cp -r "src" "build/$2/resources/app"
        mv "build/$2/electron.exe" "build/$2/$BIN_WINDOWS"
    fi
    if [[ $2 =~ macosx.* ]]
    then
        rm -r -f "build/$2/Electron.app/Contents/Resources/"*.lproj
        rm -r -f "build/$2/Electron.app/Contents/Resources/default_app.asar"
        #cp -r "src" "build/$2/Electron.app/Contents/Resources/app"
        asar pack "src" "build/$2/Electron.app/Contents/Resources/app.asar"
        mv "build/$2/Electron.app/Contents/MacOS/Electron" "build/$2/Electron.app/Contents/MacOS/$BIN_DARWIN"
    fi
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