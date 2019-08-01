#!/bin/bash

set -e

cd "$(dirname $0)/src/web"

DIR=./build/htdocs
KEY=../../hakuneko.key
DST=../../../../releases/5.0.8
REV=$(git log -1 --format="%H")
VER=$(echo $REV | cut -c 1-6)

git stash push -u -m 'Cleanup before Deploy'
polymer build
# overwrite the polymer minified/obfuscated js files with the original minified/obfuscated js files (e.g. prevent breaking hls.light.min.js when minified by polymer)
cp -f ./js/*.min.js $DIR/js/
# polymer will break files that are already obfuscated, so use the original obfuscated files => otherwise leads to blank/white screen + out-of-memory error in electron
cp -f ./lib/hakuneko/engine/base/connectors/mangago.html $DIR/lib/hakuneko/engine/base/connectors/mangago.html
cp -f ./lib/hakuneko/engine/base/connectors/tencentcomic.html $DIR/lib/hakuneko/engine/base/connectors/tencentcomic.html
git stash list | grep -q 'Cleanup before Deploy' && git stash pop

cd $DIR
# update version file before deployment
echo "<script>" > "lib/hakuneko/version.html"
echo "var revision = {" >> "lib/hakuneko/version.html"
echo "    id: '${VER}'," >> "lib/hakuneko/version.html"
echo "    url: 'https://github.com/manga-download/hakuneko/commits/${REV}'" >> "lib/hakuneko/version.html"
echo "};" >> "lib/hakuneko/version.html"
echo "</script>" >> "lib/hakuneko/version.html"

zip -r $VER.zip .
echo -n $VER.zip?signature=$(openssl dgst -sha256 -hex -sign $KEY $VER.zip | cut -d' ' -f2) > latest

# publish
rm -r -f $DST/*
cp latest $VER.zip $DST
cd $DST
git add .
git commit -m 'updated releases'
git push origin master