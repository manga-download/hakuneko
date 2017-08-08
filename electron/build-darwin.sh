#!/bin/bash

. "./build.sh"

DIR_64="${PACKAGE}_${VERSION}_darwin_amd64"

function dmg {
    # replace icns
    rm -f "build/$1/Electron.app/Contents/Resources/electron.icns"
    cp "res/icon.icns" "build/$1/Electron.app/Contents/Resources/${PACKAGE}.icns"
    # update "build/$2/Electron.app/Contents/Info.plist"
    mv "build/$1/Electron.app" "build/$1/${PRODUCT}.app"
    echo "TODO: creating dmg image => $1.dmg"
}

build "darwin-x64" "$DIR_64"
dmg "$DIR_64"