#!/bin/bash

VER="v2.0.5"

rm -f *.zip

case "$OSTYPE" in
  solaris*) SYS=() ;;
  darwin*)  SYS=( "darwin-x64" ) ;; 
  linux*)   SYS=( "linux-ia32" "linux-x64" ) ;;
  bsd*)     SYS=() ;;
  msys*)    SYS=( "win32-ia32" "win32-x64" ) ;;
  *)        SYS=() ;;
esac

for OS in "${SYS[@]}"
do
    curl -L -O "https://github.com/electron/electron/releases/download/$VER/electron-$VER-$OS.zip"
done
