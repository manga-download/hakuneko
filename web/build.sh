#!/bin/bash

DIR=../cloud/htdocs
KEY=../../web/hakuneko.key
REV=$(git log -1 --format="%H")
VER=$(echo $REV | cut -c 1-6)

echo "<script>" > "lib/hakuneko/version.html"
echo "var revision = {" >> "lib/hakuneko/version.html"
echo "    id: '${VER}'," >> "lib/hakuneko/version.html"
echo "    url: 'https://sourceforge.net/p/hakuneko/code/ci/${REV}/'" >> "lib/hakuneko/version.html"
echo "};" >> "lib/hakuneko/version.html"
echo "</script>" >> "lib/hakuneko/version.html"

rm -r -f $DIR
polymer build
cd $DIR
zip -r $VER.zip .
openssl dgst -sha256 -sign $KEY -out $VER.sig $VER.zip
echo -n $VER > latest