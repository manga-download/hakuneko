#!/bin/bash

. "./build.sh"

DIR_32="${PACKAGE}_${VERSION}_linux_i686"
DIR_64="${PACKAGE}_${VERSION}_linux_amd64"

function deb {
    # check if this is a deb based distribution with dpkg tool ...
    rm -r -f "build/$2"
    cp -r "redist/deb" "build/$2"
    build "$1" "$2/usr/lib/hakuneko-desktop"

    find "build/$2" -type f -not -path "build/$2/DEBIAN/*" -print0 | xargs -0 md5sum | sed 's|build/$2/||g' > "build/$2/DEBIAN/md5sums"

    rm -f "build/$2.deb"
	dpkg-deb -v -b "build/$2" "build/$2.deb"
	#rm -f -r deb
	lintian --profile debian "build/$2.deb"

    echo "TODO: creating deb pakage => $2.deb"
}

function rpm {
    # check if this is a rpm based distribution with any rpm tool ...
    echo "TODO: creating rpm package => $1.rpm"
}

deb "linux-x64" "$DIR_64"
rpm "$DIR_64"

deb "linux-ia32" "$DIR_32"
rpm "$DIR_32"