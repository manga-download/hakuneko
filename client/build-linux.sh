#!/bin/bash

. "./build.sh"

DIR_32="${PACKAGE}_${VERSION}_linux_i386"
DIR_64="${PACKAGE}_${VERSION}_linux_amd64"

function app_manpage {
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

function app_changelog {
	mkdir -p "build/$1/usr/share/doc/${PACKAGE}"
	echo "" > "build/$1/usr/share/doc/${PACKAGE}/changelog"
	gzip -n -f -9 "build/$1/usr/share/doc/${PACKAGE}/changelog"
}

function app_desktop {
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

function app_menu {
	mkdir -p "build/$1/usr/share/menu"
	echo "?package(${PACKAGE}): \\" > "build/$1/usr/share/menu/${PACKAGE}"
    echo "needs=\"X11\" \\" >> "build/$1/usr/share/menu/${PACKAGE}"
    echo "section=\"Applications/Network/File Transfer\" \\" >> "build/$1/usr/share/menu/${PACKAGE}"
    echo "title=\"${PRODUCT}\" \\" >> "build/$1/usr/share/menu/${PACKAGE}"
    echo "longtitle=\"${DESCRIPTION_SHORT}\" \\" >> "build/$1/usr/share/menu/${PACKAGE}"
    echo "icon=\"/usr/share/pixmaps/${PACKAGE}.xpm\" \\" >> "build/$1/usr/share/menu/${PACKAGE}"
    echo "command=\"/usr/bin/${PACKAGE}\"" >> "build/$1/usr/share/menu/${PACKAGE}"
}

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

function build_deb {
	dpkg --version > /dev/null 2>&1
    if [ $? == 0 ]
    then
		rm -r -f "build/$2"
		cp -r "redist/deb" "build/$2"
		build "$1" "$2/usr/lib/hakuneko-desktop"
		app_manpage "$2"
		app_changelog "$2"
		app_desktop "$2"
		#app_menu "$2"
		deb_control "$2"
		find "build/$2" -type f -not -path "build/$2/DEBIAN/*" -print0 | xargs -0 md5sum | sed "s|build/$2/||g" > "build/$2/DEBIAN/md5sums"
		rm -f "build/$2.deb"
		dpkg-deb -v -b "build/$2" "build/$2.deb"
		#rm -f -r deb
		lintian --profile debian "build/$2.deb" || true
	fi
}

function rpm_spec {
	#RPMPKG=$CWD/$PKGNAME\_$PKGVERSION\_$(get_lsb_release).rpm
	#cp -r $DIST_DIR/* build/$2
	echo "Name: ${PACKAGE}" > build/specfile.spec
	echo "Version: ${VERSION}" >> build/specfile.spec
	echo "Release: 0" >> build/specfile.spec
	echo "License: public domain" >> build/specfile.spec
	echo "URL: ${URL}" >> build/specfile.spec
	#echo "Requires: libc" >> build/specfile.spec
	echo "Summary: ${DESCRIPTION_SHORT}" >> build/specfile.spec
	echo "" >> build/specfile.spec
	echo "Autoreq: no" >> build/specfile.spec
	#echo "AutoReqProv: no" >> build/specfile.spec
	echo "" >> build/specfile.spec
	echo "%description" >> build/specfile.spec
	echo "${DESCRIPTION_LONG}" >> build/specfile.spec
	echo "" >> build/specfile.spec
	echo "%files" >> build/specfile.spec
	find "build/$1" -type f | sed "s/build\/$1//g" >> build/specfile.spec
	echo "" >> build/specfile.spec
	echo "%post" >> build/specfile.spec
	echo "if [ ! -f /usr/bin/hakuneko-desktop ] ; then ln -s /usr/lib/hakuneko-desktop/hakuneko /usr/bin/hakuneko-desktop ; fi" >> build/specfile.spec
	echo "" >> build/specfile.spec
	echo "%postun" >> build/specfile.spec
	echo "if [ -f /usr/bin/hakuneko-desktop ] ; then rm -f /usr/bin/hakuneko-desktop ; fi" >> build/specfile.spec
}

function build_rpm {
	rpm --version > /dev/null 2>&1
    if [ $? == 0 ]
    then
		rm -r -f "build/$2"
		cp -r "redist/rpm" "build/$2"
		build "$1" "$2/usr/lib/hakuneko-desktop"
		#app_manpage "$2"
		#app_changelog "$2"
		app_desktop "$2"
		#app_menu "$2"
		rpm_spec "$2"
		rpmbuild -bb --noclean --define "_topdir $(pwd)/build/$2" --define "buildroot %{_topdir}" "build/specfile.spec"
		rm -f "build/$2.rpm"
		mv -f build/$2/RPMS/*/*.rpm build/$2.rpm
		rm -f "build/specfile.spec"
    fi
}

build_deb "linux-x64" "$DIR_64"
build_rpm "linux-x64" "$DIR_64"

build_deb "linux-ia32" "$DIR_32"
build_rpm "linux-ia32" "$DIR_32"