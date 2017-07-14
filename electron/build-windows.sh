#!/bin/bash

. "./build.sh"

DIR_32="${PACKAGE}_${VERSION}_windows-portable_i686"
DIR_64="${PACKAGE}_${VERSION}_windows-portable_amd64"

function rcedit {
  ./rcedit.exe "build/$1/$BIN_WINDOWS" \
    --set-version-string "ProductName" "$PRODUCT" \
    --set-version-string "CompanyName" "" \
    --set-version-string "LegalCopyright" "$YEAR" \
    --set-version-string "FileDescription" "$DESCRIPTION_SHORT" \
    --set-version-string "InternalName" "" \
    --set-version-string "OriginalFilename" "$BIN_WINDOWS" \
    --set-file-version "$VERSION" \
    --set-product-version "$VERSION" \
    --set-icon "res/icon.ico"
}

# create exe
function setup {
  ISS="build/setup.iss"
  echo "[Setup]" > "$ISS"
  echo "AppName=$PRODUCT" >> "$ISS"
  echo "AppVerName=$PRODUCT" >> "$ISS"
  echo "AppVersion=$VERSION" >> "$ISS"
  echo "VersionInfoVersion=$VERSION" >> "$ISS"
  echo "AppPublisher=$PUBLISHER" >> "$ISS"
  echo "AppPublisherURL=$URL" >> "$ISS"
  if [[ $1 =~ .*amd64 ]]
  then
      echo "ArchitecturesInstallIn64BitMode=x64" >> "$ISS"
  fi
  echo "DisableWelcomePage=yes" >> "$ISS"
  echo "DefaultDirName={pf}\\$PRODUCT" >> "$ISS"
  echo "DisableProgramGroupPage=yes" >> "$ISS"
  #echo "DefaultGroupName=$PRODUCT" >> "$ISS"
  echo "DisableReadyPage=yes" >> "$ISS"
  echo "UninstallDisplayIcon={app}\\$BIN_WINDOWS" >> "$ISS"
  #echo "WizardImageFile=compiler:wizmodernimage.bmp" >> "$ISS"
  #echo "WizardSmallImageFile=compiler:wizmodernsmallimage.bmp" >> "$ISS"
  echo "WizardImageFile=..\\res\\WizModernImage.bmp" >> "$ISS"
  echo "WizardSmallImageFile=..\\res\\WizModernSmallImage.bmp" >> "$ISS"
  echo "OutputDir=." >> "$ISS"
  echo "OutputBaseFilename=$(echo $1 | sed 's/portable/setup/g')" >> "$ISS"
  echo "ChangesEnvironment=yes" >> "$ISS"
  echo "" >> "$ISS"
  echo "[Tasks]" >> "$ISS"
  echo "Name: shortcuts; Description: \"All\"; GroupDescription: \"Create Shortcuts:\";" >> "$ISS"
  echo "Name: shortcuts\\desktop; Description: \"Desktop\"; GroupDescription: \"Create Shortcuts:\";" >> "$ISS"
  echo "Name: shortcuts\\startmenu; Description: \"Startmenu Programs\"; GroupDescription: \"Create Shortcuts:\"; Flags: unchecked" >> "$ISS"
  echo "" >> "$ISS"
  echo "[Files]" >> "$ISS"
  echo "Source: $1\\*; DestDir: {app}; Flags: recursesubdirs" >> "$ISS"
  echo "" >> "$ISS"
  #echo "[UninstallDelete]"" >> "$ISS"
  #echo "Name: {app}; Type: filesandordirs" >> "$ISS"
  echo "" >> "$ISS"
  echo "[Icons]" >> "$ISS"
  echo "Name: \"{commondesktop}\\$PRODUCT\"; Tasks: shortcuts\\desktop; Filename: \"{app}\\$BIN_WINDOWS\";" >> "$ISS"
  echo "Name: \"{commonstartmenu}\\$PRODUCT\"; Tasks: shortcuts\\startmenu; Filename: \"{app}\\$BIN_WINDOWS\";" >> "$ISS"

  ISCC "$ISS"
  rm -f "$ISS"
}

# create msi
# https://themech.net/2008/08/how-to-create-a-simple-msi-installer-using-wix/
function installer {
  WXS="build/installer.wxs"
  echo "<?xml version=\"1.0\" encoding=\"utf-8\"?>" > "$WXS"
  echo "<Wix xmlns=\"http://schemas.microsoft.com/wix/2006/wi\">" >> "$WXS"
  echo "    <Product Name=\"$PRODUCT\" Id=\"*\" UpgradeCode=\"{32318521-631C-4064-88C6-4A54FAA3B383}\" Language=\"1033\" Version=\"$VERSION\" Manufacturer=\"$PUBLISHER\">" >> "$WXS"
  echo "        <Package Id=\"*\" InstallerVersion=\"200\" Compressed=\"yes\" />" >> "$WXS"
  echo "        <Media Id=\"1\" Cabinet=\"HakuNeko.cab\" EmbedCab=\"yes\" />" >> "$WXS"
  echo "        <Directory Id=\"TARGETDIR\" Name=\"SourceDir\">" >> "$WXS"
  echo "            <Directory Id=\"ProgramFilesFolder\">" >> "$WXS"
  echo "                <Directory Id=\"INSTALLDIR\" Name=\"$PRODUCT\">" >> "$WXS"

  # heat dir ".\build\hakuneko-desktop_0.0.31_windows-portable_amd64" -nologo -suid -srd -sfrag -sreg -ag -wx -dr ".\build\hakuneko-desktop_0.0.31_windows-portable_amd64" -var var.Output -out .\fragment.wxs
  # ... merge fragment and installer.wix?
  echo "                    <Component Id=\"MainExecutable\" Guid=\"*\">" >> "$WXS"
  echo "                        <File Id=\"$BIN_WINDOWS\" Name=\"$BIN_WINDOWS\" Source=\".\\$1\\$BIN_WINDOWS\" Vital=\"yes\">" >> "$WXS"
#  echo "                            <Shortcut Id=\"startmenuHakuNeko\" Directory=\"ProgramMenuDir\" Name=\"$PRODUCT\" WorkingDirectory=\"INSTALLDIR\" Icon=\"icon.ico\" IconIndex=\"0\" Advertise=\"yes\" />" >> "$WXS"
  echo "                        </File>" >> "$WXS"
  echo "                        <RemoveFolder Id=\"INSTALLDIR\" On=\"uninstall\" />" >> "$WXS"
  echo "                    </Component>" >> "$WXS"

  echo "                </Directory>" >> "$WXS"
  echo "            </Directory>" >> "$WXS"
  echo "        </Directory>" >> "$WXS"
#  echo "        <Icon Id=\"icon.ico\" SourceFile=\"..\\res\\icon.ico\"/>" >> "$WXS"
  echo "        <Feature Id=\"Complete\" Level=\"1\">" >> "$WXS"
  echo "            <ComponentRef Id=\"MainExecutable\" />" >> "$WXS"
#  echo "            <ComponentRef Id=\"ProgramMenuDir\" />" >> "$WXS"
  echo "        </Feature>" >> "$WXS"
#  echo "        <WixVariable Id=\"WixUIBannerBmp\" Value=\"bannrbmp.bmp\" />" >> "$WXS"
#  echo "        <WixVariable Id=\"WixUIDialogBmp\" Value=\"dlgbmp.bmp\" />" >> "$WXS"
#  echo "        <Property Id=\"WIXUI_INSTALLDIR\" Value=\"INSTALLDIR\" />" >> "$WXS"
#  echo "        <UIRef Id=\"MyWixUI_InstallDir\" />" >> "$WXS"
  echo "    </Product>" >> "$WXS"
  echo "</Wix>" >> "$WXS"

  candle -out "${WXS}obj" "$WXS"
  light -out "build/$1.msi" "${WXS}obj" -ext "WixUIExtension"
  rm -f "$WXS" "${WXS}obj" "build/$1.wixpdb"
}

build "win32-x64" "$DIR_64"
rcedit "$DIR_64"
compress "$DIR_64"
setup "$DIR_64"
#installer "$DIR_64"

build "win32-ia32" "$DIR_32"
rcedit "$DIR_32"
compress "$DIR_32"
setup "$DIR_32"
#installer "$DIR_32"