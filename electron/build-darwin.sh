#!/bin/bash

. "./build.sh"

function dmg {
    echo "TODO: creating dmg image => $1.dmg"
}

build "darwin-x64" "hakuneko-desktop_0.0.31_darwin_amd64"
compress "hakuneko-desktop_0.0.31_darwin_amd64"
dmg "hakuneko-desktop_0.0.31_linux_amd64"