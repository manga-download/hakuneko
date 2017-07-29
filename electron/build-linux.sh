#!/bin/bash

. "./build.sh"

DIR_32="${PACKAGE}_${VERSION}_linux_i386"
DIR_64="${PACKAGE}_${VERSION}_linux_amd64"

function deb_control {
    echo "Package: ${PACKAGE}" > "build/$1/DEBIAN/control"
	echo "Version: ${VERSION}" >> "build/$1/DEBIAN/control"
	echo "Section: net" >> "build/$1/DEBIAN/control"
	echo "Architecture: $(echo $1 | cut -d'_' -f4)" >> "build/$1/DEBIAN/control"
	echo "Installed-Size: $(du -k -c build/$1/usr | grep total | cut -f1)" >> "build/$1/DEBIAN/control"
	#echo "Depends: " >> "build/$1/DEBIAN/control"
	echo "Maintainer: ${PUBLISHER}" >> "build/$1/DEBIAN/control"
	echo "Priority: optional" >> "build/$1/DEBIAN/control"
	echo "Homepage: ${URL}" >> "build/$1/DEBIAN/control"
	echo "Description: ${DESCRIPTION_SHORT}" >> "build/$1/DEBIAN/control"
	echo " ${DESCRIPTION_LONG}" >> "build/$1/DEBIAN/control"
}

function deb_manpage {
	mkdir -p "build/$1/usr/share/man/man1"
	echo ".TH ${PACKAGE} 1 \"\" \"\"" > "build/$1/usr/share/man/man1/${PACKAGE}.1"
	echo "" >> "build/$1/usr/share/man/man1/${PACKAGE}.1"
	echo ".SH NAME" >> "build/$1/usr/share/man/man1/${PACKAGE}.1"
	echo "${PACKAGE} \- ${DESCRIPTION_SHORT}" >> "build/$1/usr/share/man/man1/${PACKAGE}.1"
	echo "" >> "build/$1/usr/share/man/man1/${PACKAGE}.1"
	echo ".SH SYNOPSIS" >> "build/$1/usr/share/man/man1/${PACKAGE}.1"
	echo "${PACKAGE}" >> "build/$1/usr/share/man/man1/${PACKAGE}.1"
	echo "" >> "build/$1/usr/share/man/man1/${PACKAGE}.1"
	echo ".SH DESCRIPTION" >> "build/$1/usr/share/man/man1/${PACKAGE}.1"
	echo "${DESCRIPTION_LONG}" >> "build/$1/usr/share/man/man1/${PACKAGE}.1"
	gzip -n -f -9 "build/$1/usr/share/man/man1/${PACKAGE}.1"
}

function deb_changelog {
	mkdir -p "build/$1/usr/share/doc/${PACKAGE}"
	echo "" > "build/$1/usr/share/doc/${PACKAGE}/changelog"
	gzip -n -f -9 "build/$1/usr/share/doc/${PACKAGE}/changelog"
}

function deb_application {
	mkdir -p "build/$1/usr/share/applications"
	echo "[Desktop Entry]" > "build/$1/usr/share/applications/${PACKAGE}.desktop"
	
	echo "Version=1.0" >> "build/$1/usr/share/applications/${PACKAGE}.desktop"
	echo "Type=Application" >> "build/$1/usr/share/applications/${PACKAGE}.desktop"
	echo "Name=${PRODUCT}" >> "build/$1/usr/share/applications/${PACKAGE}.desktop"
	echo "GenericName=${DESCRIPTION_SHORT}" >> "build/$1/usr/share/applications/${PACKAGE}.desktop"
	echo "Exec=${PACKAGE}" >> "build/$1/usr/share/applications/${PACKAGE}.desktop"
	echo "Icon=${PACKAGE}" >> "build/$1/usr/share/applications/${PACKAGE}.desktop"
	echo "Categories=Network;FileTransfer;" >> "build/$1/usr/share/applications/${PACKAGE}.desktop"
}

function deb_menu {
	mkdir -p "build/$1/usr/share/menu"
	echo "?package(${PACKAGE}): \\" > "build/$1/usr/share/menu/${PACKAGE}"
    echo "needs=\"X11\" \\" >> "build/$1/usr/share/menu/${PACKAGE}"
    echo "section=\"Applications/Network/File Transfer\" \\" >> "build/$1/usr/share/menu/${PACKAGE}"
    echo "title=\"${PRODUCT}\" \\" >> "build/$1/usr/share/menu/${PACKAGE}"
    echo "longtitle=\"${DESCRIPTION_SHORT}\" \\" >> "build/$1/usr/share/menu/${PACKAGE}"
    echo "icon=\"/usr/share/pixmaps/${PACKAGE}.xpm\" \\" >> "build/$1/usr/share/menu/${PACKAGE}"
    echo "command=\"/usr/bin/${PACKAGE}\"" >> "build/$1/usr/share/menu/${PACKAGE}"
}

function deb {
    # check if this is a deb based distribution with dpkg tool ...
    rm -r -f "build/$2"
    cp -r "redist/deb" "build/$2"
    build "$1" "$2/usr/lib/hakuneko-desktop"
	deb_control "$2"
	deb_manpage "$2"
	deb_changelog "$2"
	deb_application "$2"
	#deb_menu "$2"
    find "build/$2" -type f -not -path "build/$2/DEBIAN/*" -print0 | xargs -0 md5sum | sed "s|build/$2/||g" > "build/$2/DEBIAN/md5sums"
    rm -f "build/$2.deb"
	dpkg-deb -v -b "build/$2" "build/$2.deb"
	#rm -f -r deb
	lintian --profile debian "build/$2.deb" || true
}

function rpm {
    # check if this is a rpm based distribution with any rpm tool ...
    echo "TODO: creating rpm package => $1.rpm"
}

deb "linux-x64" "$DIR_64"
rpm "$DIR_64"

deb "linux-ia32" "$DIR_32"
rpm "$DIR_32"