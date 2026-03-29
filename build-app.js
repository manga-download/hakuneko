const path = require('path');
const fs = require('fs-extra');
const zlib = require('zlib');
const asar = require('asar');
const https = require('https');
const eol = require('os').EOL;
const exec = require('child_process').exec;
const config = require('./build-app.config');

/**
 * Base class for platform dependent electron packagers
 */
class ElectronPackager {

    /**
     *
     */
    constructor(configuration) {
        this._configuration = configuration;
    }

    /**
     *
     */
    build(architecture) {
        throw new Error('Not implemented!');
    }

    /**
     *
     * @param {*} folder
     */
    async _getSize(folder) {
        if(process.platform !== 'win32') {
            let size = await this._executeCommand(`du -k -c "${folder}" | grep total | cut -f1`);
            return size.trim();
        } else {
            throw new Error('Not implemented!');
        }
    }

    /**
     *
     * @param {string} archive
     * @param {string} target
     */
    async _extractArchive(archive, target) {
        if(process.platform === 'win32') {
            await this._executeCommand(`7z x "${archive}" -o"${target}"`);
        } else {
            await this._executeCommand(`unzip "${archive}" -d "${target}"`);
        }
    }

    /**
     *
     * @param {string} source
     * @param {string} archive
     */
    async _compressArchive(source, archive) {
        if(process.platform === 'win32') {
            await this._executeCommand(`7z a "${archive}" "${source}"`);
        } else {
            throw new Error('Not implemented!');
        }
    }

    /**
     *
     * @param {*} file
     * @param {*} data
     * @param {*} gzip
     */
    _saveFile(file, data, gzip) {
        fs.ensureDirSync(path.dirname(file));
        let content = gzip ? zlib.gzipSync(data, { level: 9 }) : data;
        fs.writeFileSync(file, content, typeof content === 'string' ? { encoding: 'utf8' } : undefined);
    }

    /**
     *
     * @param {*} uri
     * @param {*} file
     */
    _download(uri, file) {
        return new Promise( (resolve, reject) => {
            https.get(uri, response => {
                if(response.headers['location']) {
                    this._download(response.headers['location'], file)
                        .then(() => resolve())
                        .catch(error => reject(error));
                } else {
                    if(response.statusCode === 200) {
                        console.log('Downloading:', file);
                        let stream = fs.createWriteStream(file);
                        response.pipe(stream);
                        stream.on('finish', () => resolve());
                        stream.on('error', error => reject(error));
                    } else {
                        console.error('Download Failed!');
                        reject(new Error('Failed to download electron client!'));
                    }
                }
            });
        });
    }

    /**
     *
     * @param {*} version
     * @param {*} platform
     */
    async _downloadElectron(version, platform, directory) {
        let file = `electron-v${version}-${platform}.zip`;
        let uri = `https://github.com/electron/electron/releases/download/v${version}/${file}`;
        file = path.join('redist', file);

        if(!fs.existsSync(file)) {
            await this._download(uri, file);
        }
        await fs.ensureDir(directory);
        await this._extractArchive(file, directory);
        await fs.remove(path.join(directory, 'version'));
        await fs.remove(path.join(directory, 'LICENSE'));
        await fs.remove(path.join(directory, 'LICENSES.chromium.html'));
    }

    /**
     *
     * @param {string} moduleName
     * @param {string} imageName Name of the binary image (wihtout any extension)
     * @param {string} platform
     * @param {bool} is64
     */
    async _bundleStaticBinary(moduleName, imageName, platform, architecture) {
        let binary = imageName + (process.platform === 'win32' ? '.exe' : '');
        let source = path.join('node_modules', '@hakuneko', moduleName, 'bin', platform, architecture, binary);
        let target = path.join(this._stagingExecutableDirectory, binary);
        console.log(`Bundle '${source}' ...`);
        if(await fs.exists(source)) {
            await fs.copy(source, target);
            await fs.chmod(target, '0755');
            console.log(`  => File bundled: '${target}'`);
        } else {
            console.log('  => File not found: skipped');
        }
    }

    /**
     *
     * @param {string} architecture
     */
    async _bundleFFMPEG(architecture) {
        await this._bundleStaticBinary('ffmpeg-binaries', 'ffmpeg', process.platform, architecture);
    }

    /**
     *
     * @param {string} architecture
     */
    async _bundleImageMagick(architecture) {
        await this._bundleStaticBinary('imagemagick-binaries', 'convert', process.platform, architecture);
    }

    /**
     *
     * @param {string} architecture
     */
    async _bundleKindleGenerate(architecture) {
        await this._bundleStaticBinary('kindlegen-binaries', 'kindlegen', process.platform, architecture);
    }

    /**
     *
     * @param {string} command
     * @param {bool} silent
     */
    _executeCommand(command, silent) {
        if(!silent) {
            console.log('>', command);
        }
        return new Promise((resolve, reject) => {
            exec(command, (error, stdout, stderr) => {
                if(!silent) {
                    console.log(stdout);
                    console.log(stderr);
                }
                if(error) {
                    reject(error);
                } else {
                    resolve(stdout);
                }
            });
        });
    }

    /**
     *
     * @param  {...string} commands
     */
    async _validateCommands(...commands) {
        for(let command of commands) {
            try {
                await this._executeCommand(command, true);
            } catch(error) {
                throw new Error(`Failed to run command '${command}', make sure it is correctly installed!`);
            }
        }
    }
}

/**
 * Packager for linux platform
 */
class ElectronPackagerLinux extends ElectronPackager {

    /**
     *
     */
    constructor(configuration) {
        super(configuration);
        this.architectures = {
            '32': {
                name: 'i386',
                suffix: 'linux_i386',
                platform: 'linux-ia32'
            },
            '64': {
                name: 'amd64',
                suffix: 'linux_amd64',
                platform: 'linux-x64'
            },
            'ARMv7': {
                name: 'armv7l',
                suffix: 'linux_armv7l',
                platform: 'linux-armv7l'
            },
            'ARMHF': {
                name: 'armhf',
                suffix: 'linux_armhf',
                platform: 'linux-armv7l'
            },
            'ARMv8': {
                name: 'arm64',
                suffix: 'linux_arm64',
                platform: 'linux-arm64'
            }
        };
        this._architecture = this.architectures[0];
    }

    /**
     *
     */
    get _dirBuildRoot() {
        return path.join('build', `${this._configuration.name.package}_${this._configuration.version}_${this._architecture.suffix}`);
    }

    /**
     *
     */
    get _stagingExecutableDirectory() {
        return path.join(this._dirBuildRoot, 'usr', 'lib', this._configuration.name.package);
    }

    /**
     *
     * @param {string} architecture '32' or '64'
     */
    async build(architecture) {
        await this.buildDEB(architecture);
        await this.buildRPM(architecture);
    }

    /**
     *
     */
    async buildDEB(architecture) {
        this._architecture = this.architectures[architecture];

        await this._validateCommands('unzip --help', 'asar --version', 'fakeroot --version', 'dpkg --version', 'lintian --version');

        await fs.remove(this._dirBuildRoot);
        await this._copySkeletonDEB();
        await this._bundleElectron();
        await this._bundleFFMPEG(this._architecture.name);
        await this._bundleImageMagick(this._architecture.name);
        await this._bundleKindleGenerate(this._architecture.name);
        this._createManpage();
        this._createChangelog();
        //this._createMenuEntry(); // => only menu or desktop is recommend
        this._createDesktopShortcut();
        await this._createControlDEB();
        this._createPostScript('postrm');
        this._createPostScript('postinst');
        await this._createChecksumsDEB();

        let deb = this._dirBuildRoot + '.deb';
        await fs.remove(deb);
        await this._executeCommand(`fakeroot dpkg-deb -v -b "${this._dirBuildRoot}" "${deb}"`);
        await this._executeCommand(`lintian --profile debian "${deb}" || true`);
    }

    /**
     *
     */
    async buildRPM(architecture) {
        this._architecture = this.architectures[architecture];

        await this._validateCommands('unzip --help', 'asar --version', 'fakeroot --version', 'rpm --version');

        await fs.remove(this._dirBuildRoot);
        await this._copySkeletonRPM();
        await this._bundleElectron();
        await this._bundleFFMPEG(this._architecture.name);
        await this._bundleImageMagick(this._architecture.name);
        await this._bundleKindleGenerate(this._architecture.name);
        this._createManpage();
        this._createChangelog();
        //this._createMenuEntry(); // => only menu or desktop is recommend
        this._createDesktopShortcut();
        let specs = await this._createSpecsRPM();

        let rpm = this._dirBuildRoot + '.rpm';
        await fs.remove(rpm);
        await this._executeCommand(`rpmbuild -bb --noclean --define "_topdir $(pwd)/${this._dirBuildRoot}" --define "buildroot %{_topdir}" "${specs}"`);
        await this._executeCommand(`mv -f ${this._dirBuildRoot}/RPMS/*/*.rpm ${rpm}`);
        await fs.remove(specs);
    }

    /**
     *
     */
    async _bundleElectron() {
        console.log('Bundle electron ...');
        let folder = this._stagingExecutableDirectory;
        await this._downloadElectron(this._configuration.version, this._architecture.platform, folder);
        await fs.remove(path.join(folder, 'resources', 'default_app.asar'));
        await asar.createPackage(config.src, path.join(folder, 'resources', 'app.asar'));
        await fs.move(path.join(folder, 'electron'), path.join(folder, this._configuration.binary.linux));
        // chmod 4755 fixes https://github.com/electron/electron/issues/17972
        await fs.chmod(path.join(folder, 'chrome-sandbox'), '4755');
        // remove executable flag from libraries => avoid lintian errors
        await this._executeCommand(`find "${folder}" -type f -iname "*.so" -exec chmod -x {} \\;`);
    }

    /**
     *
     */
    async _copySkeletonDEB() {
        console.log('Copy DEB Skeleton ...');
        //await this._executeCommand(`cp -r "redist/deb" "${this._dirBuildRoot}"`);
        await fs.copy(path.join('redist', 'deb'), this._dirBuildRoot);
    }

    /**
     *
     */
    async _copySkeletonRPM() {
        console.log('Copy RPM Skeleton ...');
        //await this._executeCommand(`cp -r "redist/rpm" "${this._dirBuildRoot}"`);
        await fs.copy(path.join('redist', 'rpm'), this._dirBuildRoot);
    }

    /**
     *
     */
    _createManpage() {
        console.log('Creating Manpage ...');
        let file = path.join(this._dirBuildRoot, 'usr', 'share', 'man', 'man1', this._configuration.name.package + '.1.gz');
        let content = [
            `.TH ${this._configuration.name.package} 1 "" ""`,
            '',
            '.SH NAME',
            `${this._configuration.name.package} - ${this._configuration.description.short}`,
            '',
            '.SH SYNOPSIS',
            this._configuration.name.package,
            '',
            '.SH DESCRIPTION',
            this._configuration.description.long
        ];
        this._saveFile(file, content.join(eol), true);
    }

    /**
     *
     */
    _createChangelog() {
        console.log('Creating Changelog ...');
        let file = path.join(this._dirBuildRoot, 'usr', 'share', 'doc', this._configuration.name.package, 'changelog.gz');
        this._saveFile(file, '-', true);
    }

    /**
     *
     */
    _createDesktopShortcut() {
        console.log('Creating Desktop Shortcut ...');
        let file = path.join(this._dirBuildRoot, 'usr', 'share', 'applications', this._configuration.name.package + '.desktop');
        let content = [
            '[Desktop Entry]',
            'Version=1.0',
            'Type=' + this._configuration.meta.type,
            'Name=' + this._configuration.name.product,
            'GenericName=' + this._configuration.description.short,
            'Exec=' + path.join('/usr', 'lib', this._configuration.name.package, this._configuration.binary.linux),
            'Icon=' + this._configuration.name.package,
            'Categories=' + this._configuration.meta.categories
        ];
        this._saveFile(file, content.join(eol), false);
    }

    /**
     *
     */
    _createMenuEntry() {
        console.log('Creatng Menu Entry');
        let file = path.join(this._dirBuildRoot, 'usr', 'share', 'menu', this._configuration.name.package);
        let content = [
            `?package(${this._configuration.name.package}):needs="X11" \\`,
            ` section="${this._configuration.meta.menu}" \\`,
            ` title="${this._configuration.name.product}" \\`,
            ` icon="/usr/share/pixmaps/${this._configuration.name.package}.xpm" \\`,
            ` command="${path.join('/usr/lib', this._configuration.name.package, this._configuration.binary.linux)}"`
        ];
        this._saveFile(file, content.join(eol), false);
    }

    /**
     *
     */
    async _createControlDEB() {
        console.log('Creating DEB Control File ...');
        let file = path.join(this._dirBuildRoot, 'DEBIAN', 'control');
        let content = [
            'Package: ' + this._configuration.name.package,
            'Version: ' + this._configuration.version,
            'Section: ' + this._configuration.meta.section,
            'Architecture: ' + this._architecture.name,
            'Installed-Size: ' + await this._getSize(path.join(this._dirBuildRoot, 'usr')),
            'Depends: ' + this._configuration.meta.dependencies.deb,
            'Maintainer: ' + this._configuration.author,
            'Priority: optional',
            'Homepage: ' + this._configuration.url,
            'Description: ' + this._configuration.description.short,
            ' ' + this._configuration.description.long,
            ''
        ];
        this._saveFile(file, content.join(eol), false);
    }

    /**
     *
     */
    _createPostScript(name) {
        console.log(`Creating PostScript '${name}' ...`);
        let file = path.join(this._dirBuildRoot, 'DEBIAN', name);
        let symbolic = path.join('/usr', 'bin', this._configuration.name.package);
        let binary = path.join('/usr', 'lib', this._configuration.name.package, this._configuration.binary.linux);
        let content = [
            '#!/bin/sh',
            'set -e',
            '#if [ -x /usr/bin/update-mime ] ; then update-mime ; fi',
            '#if [ -x /usr/bin/update-menus ] ; then update-menus ; fi'
        ];
        if(name === 'postinst') {
            content.push(`if [ ! -f ${symbolic} ] ; then ln -s ${binary} ${symbolic} ; fi`);
        }
        if(name === 'postrm') {
            content.push(`if [ -f ${symbolic} ] ; then rm -f ${symbolic} ; fi`);
        }
        this._saveFile(file, content.join(eol), false);
    }

    /**
     *
     */
    async _createChecksumsDEB() {
        console.log('Creating Checksums ...');
        await this._executeCommand(`cd "${this._dirBuildRoot}" && find usr -type f -print0 | xargs -0 md5sum > "DEBIAN/md5sums"`);
    }

    /**
     *
     */
    async _createSpecsRPM() {
        console.log('Creating RPM Specification File ...');
        let file = path.join('build', 'specfile.spec');
        let symbolic = path.join('/usr', 'bin', this._configuration.name.package);
        let binary = path.join('/usr', 'lib', this._configuration.name.package, this._configuration.binary.linux);
        let content = [
            'Name: ' + this._configuration.name.package,
            'Version: ' + this._configuration.version,
            'Release: 0',
            'License: ' + this._configuration.license,
            'URL: ' + this._configuration.url,
            'Requires: ' + this._configuration.meta.dependencies.rpm,
            'Summary: ' + this._configuration.description.short,
            '',
            'Autoreq: no',
            'AutoReqProv: no',
            '',
            '%description',
            this._configuration.description.long,
            '',
            '%files',
            `%dir /usr/lib/${this._configuration.name.package}/`,
            await this._executeCommand(`cd "${this._dirBuildRoot}" && find usr -type f -exec echo /{} \\;`),
            '%post',
            `if [ ! -f ${symbolic} ] ; then ln -s ${binary} ${symbolic} ; fi`,
            '',
            '%postun',
            `if [ -f ${symbolic} ] ; then rm -f ${symbolic} ; fi`
        ];
        this._saveFile(file, content.join(eol), false);
        return file;
    }
}

/**
 * Packager for windows platform
 */
class ElectronPackagerWindows extends ElectronPackager {

    /**
     *
     */
    constructor(configuration) {
        super(configuration);
        this.architectures = {
            '32': {
                is: {
                    name: 'i386',
                    suffix: 'windows-setup_i386',
                    platform: 'win32-ia32'
                },
                zip: {
                    name: 'i386',
                    suffix: 'windows-portable_i386',
                    platform: 'win32-ia32'
                }
            },
            '64': {
                is: {
                    name: 'amd64',
                    suffix: 'windows-setup_amd64',
                    platform: 'win32-x64'
                },
                zip: {
                    name: 'amd64',
                    suffix: 'windows-portable_amd64',
                    platform: 'win32-x64'
                }
            }
        };
        this._architecture = this.architectures[0];
    }

    /**
     *
     */
    get _dirBuildRoot() {
        return path.join('build', `${this._configuration.name.package}_${this._configuration.version}_${this._architecture.suffix}`);
    }

    /**
     *
     */
    get _stagingExecutableDirectory() {
        return this._dirBuildRoot;
    }

    /**
     *
     * @param {string} architecture '32' or '64'
     */
    async build(architecture) {
        await this.buildIS(architecture);
        await this.buildZIP(architecture);
    }

    /**
     * Create InnoSetup installer
     * @param {string} architecture
     */
    async buildIS(architecture) {
        this._architecture = this.architectures[architecture].is;

        await this._validateCommands('7z --help', 'asar --version', 'innosetup-compiler /?');

        await fs.remove(this._dirBuildRoot);
        await this._bundleElectron(false);
        await this._bundleFFMPEG(this._architecture.name);
        await this._bundleImageMagick(this._architecture.name);
        await this._bundleKindleGenerate(this._architecture.name);
        await this._editResource();
        let setup = this._createScriptIS(architecture === '64');

        await this._executeCommand(`innosetup-compiler "${setup}"`);
        await fs.remove(setup);
    }

    /**
     * Create portable archive
     * @param {string} architecture
     */
    async buildZIP(architecture) {
        this._architecture = this.architectures[architecture].zip;

        await this._validateCommands('7z --help', 'asar --version');

        await fs.remove(this._dirBuildRoot);
        await this._bundleElectron(true);
        await this._bundleFFMPEG(this._architecture.name);
        await this._bundleImageMagick(this._architecture.name);
        await this._bundleKindleGenerate(this._architecture.name);
        await this._editResource();

        let zip = this._dirBuildRoot + '.zip';
        await fs.remove(zip);
        await this._compressArchive('.\\' + this._dirBuildRoot, zip);
    }

    /**
     *
     * @param {bool} portable
     */
    async _bundleElectron(portable) {
        console.log('Bundle electron ...');
        let folder = this._stagingExecutableDirectory;
        await this._downloadElectron(this._configuration.version, this._architecture.platform, folder);
        await fs.remove(path.join(folder, 'resources', 'default_app.asar'));
        if(portable) {
            this._saveFile(path.join(folder, this._configuration.binary.windows + '.portable'), 'Delete this File to disable Portable Mode');
        }
        await asar.createPackage(config.src, path.join(folder, 'resources', 'app.asar'));
        await fs.move(path.join(folder, 'electron.exe'), path.join(folder, this._configuration.binary.windows));
    }

    /**
     *
     */
    async _editResource() {
        let command = [
            path.join('node_modules', 'rcedit', 'bin', 'rcedit.exe'),
            `"${path.join(this._dirBuildRoot, this._configuration.binary.windows)}"`,
            `--set-version-string "ProductName" "${this._configuration.name.product}"`,
            `--set-version-string "CompanyName" ""`,
            `--set-version-string "LegalCopyright" "${(new Date()).getFullYear()}"`,
            `--set-version-string "FileDescription" "${this._configuration.description.short}"`,
            `--set-version-string "InternalName" ""`,
            `--set-version-string "OriginalFilename" "${this._configuration.binary.windows}"`,
            `--set-file-version "${this._configuration.version}"`,
            `--set-product-version "${this._configuration.version}"`,
            `--set-icon "redist\\iss\\app.ico"`
        ].join(' ');
        await this._executeCommand(command);
    }

    /**
     *
     * @param {bool} is64
     */
    _createScriptIS(is64) {
        console.log('Creating InnoSetup Script ...');
        let file = path.join('build', 'setup.iss');
        let content = [
            '[Setup]',
            'AppName=' + this._configuration.name.product,
            'AppVerName=' + this._configuration.name.product,
            'AppVersion=' + this._configuration.version,
            'VersionInfoVersion=' + this._configuration.version,
            'AppPublisher=' + this._configuration.author,
            'AppPublisherURL=' + this._configuration.url,
            (is64 ? '' : ';') + 'ArchitecturesInstallIn64BitMode=x64',
            'DisableWelcomePage=yes',
            'DefaultDirName=' + path.join('{pf}', this._configuration.name.product),
            'DisableProgramGroupPage=yes',
            //'DefaultGroupName=' + this._configuration.name.product,
            'DisableReadyPage=yes',
            'UninstallDisplayIcon=' + path.join('{app}', this._configuration.binary.windows),
            //'WizardImageFile=compiler:wizmodernimage.bmp',
            //'WizardSmallImageFile=compiler:wizmodernsmallimage.bmp',
            'WizardImageFile=' + path.join('..', 'redist', 'iss', 'wizard.bmp'),
            'WizardSmallImageFile=' + path.join('..', 'redist', 'iss', 'wizard-small.bmp'),
            'OutputDir=.',
            'OutputBaseFilename=' + path.basename(this._dirBuildRoot),
            'ChangesEnvironment=yes',
            '',
            '[Tasks]',
            'Name: shortcuts; Description: "All"; GroupDescription: "Create Shortcuts:";',
            'Name: shortcuts\\desktop; Description: "Desktop"; GroupDescription: "Create Shortcuts:";',
            'Name: shortcuts\\startmenu; Description: "Startmenu Programs"; GroupDescription: "Create Shortcuts:"; Flags: unchecked',
            '',
            '[Files]',
            `Source: ${path.basename(this._dirBuildRoot)}\\*; DestDir: {app}; Flags: recursesubdirs`,
            '',
            '[UninstallDelete]',
            'Name: {app}; Type: filesandordirs',
            '',
            '[Icons]',
            `Name: "{commondesktop}\\${this._configuration.name.product}"; Tasks: shortcuts\\desktop; Filename: "{app}\\${this._configuration.binary.windows}";`,
            `Name: "{commonstartmenu}\\${this._configuration.name.product}"; Tasks: shortcuts\\startmenu; Filename: "{app}\\${this._configuration.binary.windows}";`
        ];
        this._saveFile(file, content.join(eol), false);
        return file;
    }
}

/**
 * Packager for windows platform
 */
class ElectronPackagerDarwin extends ElectronPackager {

    /**
     *
     */
    constructor(configuration) {
        super(configuration);
        this.architectures = {
            '64': {
                dmg: {
                    name: 'amd64',
                    suffix: 'macos_amd64',
                    platform: 'darwin-x64'
                }
            }
        };
        this._architecture = this.architectures[0];
    }

    /**
     *
     */
    get _dirBuildRoot() {
        return path.join('build', `${this._configuration.name.package}_${this._configuration.version}_${this._architecture.suffix}`);
    }

    /**
     *
     */
    get _stagingExecutableDirectory() {
        return path.join(this._dirBuildRoot, this._configuration.name.product + '.app', 'Contents', 'MacOS');
    }

    _wait(milliseconds) {
        return new Promise(resolve => {
            setTimeout(() => resolve(), milliseconds);
        });
    }

    /**
     *
     * @param {string} architecture '64'
     */
    async build(architecture) {
        await this.buildDMG(architecture);
    }

    /**
     * Create InnoSetup installer
     * @param {string} architecture
     */
    async buildDMG(architecture) {
        this._architecture = this.architectures[architecture].dmg;

        await this._validateCommands('hdiutil info');

        await fs.remove(this._dirBuildRoot);
        await this._bundleElectron(false);
        await this._bundleFFMPEG(this._architecture.name);
        await this._bundleImageMagick(this._architecture.name);
        await this._bundleKindleGenerate(this._architecture.name);
        await this._createPList();

        let dmg = this._dirBuildRoot + '.dmg';
        await fs.remove(dmg);
        let tmp = this._dirBuildRoot + '.tmp';
        await fs.remove(tmp + '.dmg');
        await this._executeCommand(`hdiutil create -volname "${this._configuration.name.product}" -srcfolder "${this._dirBuildRoot}" -fs "HFS+" -fsargs "-c c=64,a=16,e=16" -format "UDRW" "${tmp}"`);
        let device = (await this._executeCommand(`hdiutil attach -readwrite -noverify -noautoopen "${tmp}.dmg" | egrep '^/dev/' | sed 1q | awk '{print $1}'`)).trim();
        await this._wait(5000);
        await this._executeCommand(`echo '${this._appleScript}' | osascript`);
        await this._executeCommand(`chmod -Rf go-w "/Volumes/${this._configuration.name.product}"`);
        await this._executeCommand(`sync`);
        await this._wait(5000);
        await this._executeCommand(`hdiutil detach "${device}"`);
        await this._wait(5000);
        await this._executeCommand(`hdiutil convert "${tmp}.dmg" -format "UDZO" -imagekey zlib-level=9 -o "${dmg}"`);
        await fs.remove(tmp + '.dmg');
    }

    /**
     *
     */
    async _bundleElectron() {
        console.log('Bundle electron ...');
        let folder = path.join(this._dirBuildRoot, 'Electron.app', 'Contents');
        await this._downloadElectron(this._configuration.version, this._architecture.platform, this._dirBuildRoot);
        await fs.remove(path.join(folder, 'Resources', 'default_app.asar'));
        await asar.createPackage(config.src, path.join(folder, 'Resources', 'app.asar'));
        await fs.move(path.join(folder, 'MacOS', 'Electron'), path.join(folder, 'MacOS', this._configuration.binary.darwin));
        await fs.remove(path.join(folder, 'Resources', 'electron.icns'));
        await fs.copy('res/icon.icns', path.join(folder, 'Resources', this._configuration.binary.darwin + '.icns'));
        await fs.ensureDir(path.join(this._dirBuildRoot, '.images'));
        await fs.copy('res/OSXSetup.png', path.join(this._dirBuildRoot, '.images', 'OSXSetup.png'));
        await fs.move(path.join(this._dirBuildRoot, 'Electron.app'), path.join(this._dirBuildRoot, this._configuration.name.product + '.app'));
    }

    /**
     *
     */
    _createPList() {
        console.log('Creating P-List Info ...');
        let file = path.join(this._dirBuildRoot, this._configuration.name.product + '.app', 'Contents', 'Info.plist');
        let content = [
            '<?xml version="1.0" encoding="UTF-8"?>',
            '<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">',
            '<plist version="1.0">',
            '<dict>',
            '	<key>CFBundleDisplayName</key>',
            `	<string>${this._configuration.name.product}</string>`,
            // execytable is required
            '	<key>CFBundleExecutable</key>',
            `	<string>${this._configuration.binary.darwin}</string>`,
            // icon file is required
            '	<key>CFBundleIconFile</key>',
            `	<string>${this._configuration.binary.darwin}.icns</string>`,
            '	<key>CFBundleIdentifier</key>',
            `	<string>${this._configuration.url}</string>`,
            '	<key>CFBundleName</key>',
            `	<string>${this._configuration.name.product}</string>`,
            '	<key>CFBundlePackageType</key>',
            '	<string>APPL</string>',
            '	<key>CFBundleShortVersionString</key>',
            `	<string>${this._configuration.version}</string>`,
            '	<key>CFBundleVersion</key>',
            `	<string>${this._configuration.version}</string>`,
            '	<key>LSMinimumSystemVersion</key>',
            '	<string>10.10.0</string>',
            '	<key>NSHighResolutionCapable</key>',
            '	<true/>',
            '</dict>',
            '</plist>'
        ];
        this._saveFile(file, content.join(eol), false);
        return file;
    }

    get _appleScript() {
        return `
        tell application "Finder"
            tell disk "${this._configuration.name.product}"
                open
                set current view of container window to icon view
                set toolbar visible of container window to false
                set statusbar visible of container window to false
                set the bounds of container window to {100, 100, 560, 620}
                set theViewOptions to the icon view options of container window
                set arrangement of theViewOptions to not arranged
                set icon size of theViewOptions to 64
                set background picture of theViewOptions to file ".images:OSXSetup.png"
                make new alias file at container window to POSIX file "/Applications" with properties {name:"Applications"}
                set position of item "'${this._configuration.name.product}'" of container window to {360, 180}
                set position of item "Applications" of container window to {360, 390}
                set position of item ".fseventsd" of container window to {180, 620}
                set position of item ".images" of container window to {280, 620}
                update without registering applications
                delay 5
                close
            end tell
        end tell
        `;
    }
}

/**
 *
 */
async function main() {
    if(process.platform === 'win32') {
        let packager = new ElectronPackagerWindows(config);
        await packager.buildIS('64');
        await packager.buildIS('32');
        await packager.buildZIP('64');
        await packager.buildZIP('32');
    }
    if(process.platform === 'linux') {
        let packager = new ElectronPackagerLinux(config);
        await packager.buildDEB('64');
        await packager.buildDEB('32');
        await packager.buildDEB('ARMv8');
        await packager.buildDEB('ARMHF');
        await packager.buildDEB('ARMv7');
        await packager.buildRPM('64');
        await packager.buildRPM('32');
    }
    if(process.platform === 'darwin') {
        let packager = new ElectronPackagerDarwin(config);
        await packager.buildDMG('64');
    }
}

// exit application as soon as any uncaught exception is thrown
process.on('unhandledRejection', error => { throw error; });
main();