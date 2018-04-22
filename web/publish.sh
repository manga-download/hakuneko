#!/bin/bash

DIR=./build/htdocs
KEY=../../hakuneko.key
DST=../../../../app-releases/0.3.1
REV=$(git log -1 --format="%H")
VER=$(echo $REV | cut -c 1-6)

echo "<script>" > "lib/hakuneko/version.html"
echo "var revision = {" >> "lib/hakuneko/version.html"
echo "    id: '${VER}'," >> "lib/hakuneko/version.html"
echo "    url: 'https://sourceforge.net/p/hakuneko/code/ci/${REV}/'" >> "lib/hakuneko/version.html"
echo "};" >> "lib/hakuneko/version.html"
echo "</script>" >> "lib/hakuneko/version.html"

polymer build
# overwrite the polymer minified js files with the original minified js files (e.g. prevent breaking hls.light.min.js when minified by polymer)
cp -f ./js/*.min.js $DIR/js/
cd $DIR
zip -r $VER.zip .
echo -n $VER.zip?signature=$(openssl dgst -sha256 -hex -sign $KEY $VER.zip | cut -d' ' -f2) > latest

# publish
rm -r -f $DST/*
cp latest $VER.zip $DST
cd $DST
git add .
git commit -m 'updated releases'
git push github master