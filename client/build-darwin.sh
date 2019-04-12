#!/bin/bash

. "./build.sh"

DIR_64="${PACKAGE}_${VERSION}_macosx_amd64"

function dmg {

    echo '<?xml version="1.0" encoding="UTF-8"?>' > "build/$1/Electron.app/Contents/Info.plist"
    echo '<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">' >> "build/$1/Electron.app/Contents/Info.plist"
    echo '<plist version="1.0">' >> "build/$1/Electron.app/Contents/Info.plist"
    echo '<dict>' >> "build/$1/Electron.app/Contents/Info.plist"
    echo '	<key>CFBundleDisplayName</key>' >> "build/$1/Electron.app/Contents/Info.plist"
    echo "	<string>${PRODUCT}</string>" >> "build/$1/Electron.app/Contents/Info.plist"
    # executable is required!
    echo '	<key>CFBundleExecutable</key>' >> "build/$1/Electron.app/Contents/Info.plist"
    echo "	<string>${BIN_DARWIN}</string>" >> "build/$1/Electron.app/Contents/Info.plist"
    # icon file is required!
    echo '	<key>CFBundleIconFile</key>' >> "build/$1/Electron.app/Contents/Info.plist"
    echo "	<string>${BIN_DARWIN}.icns</string>" >> "build/$1/Electron.app/Contents/Info.plist"
    echo '	<key>CFBundleIdentifier</key>' >> "build/$1/Electron.app/Contents/Info.plist"
    echo "	<string>${URL}</string>" >> "build/$1/Electron.app/Contents/Info.plist"
    echo '	<key>CFBundleName</key>' >> "build/$1/Electron.app/Contents/Info.plist"
    echo "	<string>${PRODUCT}</string>" >> "build/$1/Electron.app/Contents/Info.plist"
    echo '	<key>CFBundlePackageType</key>' >> "build/$1/Electron.app/Contents/Info.plist"
    echo "	<string>APPL</string>" >> "build/$1/Electron.app/Contents/Info.plist"
    echo '	<key>CFBundleShortVersionString</key>' >> "build/$1/Electron.app/Contents/Info.plist"
    echo "	<string>${VERSION}</string>" >> "build/$1/Electron.app/Contents/Info.plist"
    echo '	<key>CFBundleVersion</key>' >> "build/$1/Electron.app/Contents/Info.plist"
    echo "	<string>${VERSION}</string>" >> "build/$1/Electron.app/Contents/Info.plist"
    echo '	<key>LSMinimumSystemVersion</key>' >> "build/$1/Electron.app/Contents/Info.plist"
    echo "	<string>10.9.0</string>" >> "build/$1/Electron.app/Contents/Info.plist"
    echo '	<key>NSHighResolutionCapable</key>' >> "build/$1/Electron.app/Contents/Info.plist"
    echo "	<true/>" >> "build/$1/Electron.app/Contents/Info.plist"
    echo '</dict>'>> "build/$1/Electron.app/Contents/Info.plist"
    echo '</plist>'>> "build/$1/Electron.app/Contents/Info.plist"

    rm -f "build/$1/Electron.app/Contents/Resources/electron.icns"
    cp "res/icon.icns" "build/$1/Electron.app/Contents/Resources/${BIN_DARWIN}.icns"
    mkdir -p "build/$1/.images"
    cp "res/OSXSetup.png" "build/$1/.images/OSXSetup.png"
    mv "build/$1/Electron.app" "build/$1/${PRODUCT}.app"
    rm -f "build/$1.dmg"
    hdiutil create -volname "${PRODUCT}" -srcfolder "build/$1" -fs "HFS+" -fsargs "-c c=64,a=16,e=16" -format "UDRW" "build/$1.tmp.dmg"
    device=$(hdiutil attach -readwrite -noverify -noautoopen "build/$1.tmp.dmg" | egrep '^/dev/' | sed 1q | awk '{print $1}')
    sleep 5
    echo '
    tell application "Finder"
        tell disk "'${PRODUCT}'"
            open
            set current view of container window to icon view
            set toolbar visible of container window to false
            set statusbar visible of container window to false
            set the bounds of container window to {100, 100, 560, 620}
            set theViewOptions to the icon view options of container window
            set arrangement of theViewOptions to not arranged
            set icon size of theViewOptions to 64
            set background picture of theViewOptions to file ".images:OSXSetup.png"
            make new alias file at container window to POSIX file "/Applications" with properties {name:"Applications"}
            set position of item "'${PRODUCT}'" of container window to {360, 180}
            set position of item "Applications" of container window to {360, 390}
            update without registering applications
            delay 5
            close
        end tell
    end tell
    ' | osascript

    chmod -Rf go-w "/Volumes/${PRODUCT}"
    sync
    sleep 5
    hdiutil detach "${device}"
    sleep 5
    hdiutil convert "build/$1.tmp.dmg" -format "UDZO" -imagekey zlib-level=9 -o "build/$1.dmg"
    rm -f "build/$1.tmp.dmg"
}

build "darwin-x64" "$DIR_64"
dmg "$DIR_64"