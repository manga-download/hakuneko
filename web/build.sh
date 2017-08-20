#!/bin/bash

REV=$(git log -1 --format="%H")
echo "<script>" > "lib/hakuneko/version.html"
echo "var revision = {" >> "lib/hakuneko/version.html"
echo "    id: '$(echo $REV | cut -c 1-6)'," >> "lib/hakuneko/version.html"
echo "    url: 'https://sourceforge.net/p/hakuneko/code/ci/${REV}/'" >> "lib/hakuneko/version.html"
echo "};" >> "lib/hakuneko/version.html"
echo "</script>" >> "lib/hakuneko/version.html"

polymer build