#!/bin/bash

. "./build.sh"

DIR_64="${PACKAGE}_${VERSION}_darwin_amd64"

function dmg {
    sed "/<key>CFBundleName<\/key>/!b;n;c<string>${PRODUCT}</string>" -i "build/$1/Electron.app/Contents/Info.plist"
    sed "/<key>CFBundleDisplayName<\/key>/!b;n;c<string>${PRODUCT}</string>" -i "build/$1/Electron.app/Contents/Info.plist"
	sed "/<key>CFBundleExecutable<\/key>/!b;n;c<string>${BIN_DARWIN}</string>" -i "build/$1/Electron.app/Contents/Info.plist"
	sed "/<key>CFBundleIconFile<\/key>/!b;n;c<string>${PACKAGE}.icns</string>" -i "build/$1/Electron.app/Contents/Info.plist"
	sed "/<key>CFBundleIdentifier<\/key>/!b;n;c<string>${URL}</string>" -i "build/$1/Electron.app/Contents/Info.plist"
	sed "/<key>CFBundleShortVersionString<\/key>/!b;n;c<string>${VERSION}</string>" -i "build/$1/Electron.app/Contents/Info.plist"
	sed "/<key>CFBundleVersion<\/key>/!b;n;c<string>${VERSION}</string>" -i "build/$1/Electron.app/Contents/Info.plist"
	sed "/<key>LSApplicationCategoryType<\/key>/!b;n;c<string>public.app-category.developer-tools</string>" -i "build/$1/Electron.app/Contents/Info.plist"
    # replace icns
    rm -f "build/$1/Electron.app/Contents/Resources/electron.icns"
    cp "res/icon.icns" "build/$1/Electron.app/Contents/Resources/${PACKAGE}.icns"
    # update "build/$2/Electron.app/Contents/Info.plist"
    mv "build/$1/Electron.app" "build/$1/${PRODUCT}.app"
    echo "TODO: creating dmg image => $1.dmg"
}

build "darwin-x64" "$DIR_64"
dmg "$DIR_64"