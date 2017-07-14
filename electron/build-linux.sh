#!/bin/bash

. "./build.sh"

function deb {
    # check if this is a deb based distribution with dpkg tool ...
    echo "TODO: creating deb pakage => $1.deb"
}

function rpm {
    # check if this is a rpm based distribution with any rpm tool ...
    echo "TODO: creating rpm package => $1.rpm"
}

build "linux-x64" "hakuneko-desktop_0.0.31_linux_amd64"
compress "hakuneko-desktop_0.0.31_linux_amd64"
deb "hakuneko-desktop_0.0.31_linux_amd64"
rpm "hakuneko-desktop_0.0.31_linux_amd64"

build "linux-ia32" "hakuneko-desktop_0.0.31_linux_i686"
compress "hakuneko-desktop_0.0.31_linux_i686"
deb "hakuneko-desktop_0.0.31_linux_i686"
rpm "hakuneko-desktop_0.0.31_linux_i686"