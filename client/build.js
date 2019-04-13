const fs = require('fs');
const path = require('path');
const zlib = require('zlib');
const https = require('https');
const exec = require('child_process').exec;
const config = require('../build.config');
const eol = require('os').EOL;

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
    _getSize(folder) {
        // du -k -c build/$1/usr | grep total | cut -f1
        return 123456789;
    }

    /**
     * 
     * @param {string} file 
     */
    async _deleteFile(file) {
        // TODO: Make this platform independent!
        if(process.platform === 'win32') {
            await this._executeCommand(`if exist "${file}" del /f /q "${file}"`);
        } else {
            await this._executeCommand(`rm -f "${file}"`);
        }
    }

    /**
     * 
     * @param {*} directory 
     */
    async _deleteDirectoryRecursive(directory) {
        // TODO: Make this platform independent!
        if(process.platform === 'win32') {
            await this._executeCommand(`if exist "${directory}" rd /s /q "${directory}"`);
            console.log('Directory Deleted:', directory);
        } else {
            await this._executeCommand(`rm -r -f "${directory}"`);
            console.log('Directory Deleted:', directory);
        }
    }

    /**
     * Helper function to recursively create all non-existing folders of the given path.
     * @param {*} directory 
     */
    _createDirectoryChain(directory) {
        if(!fs.existsSync(directory) && directory !== path.parse(directory).root) {
            this._createDirectoryChain(path.dirname(directory));
            fs.mkdirSync(directory, '0755', true);
            console.log('Directory Created:', directory);
        }
    }

    /**
     * 
     * @param {string} archive 
     * @param {string} target 
     */
    async _extractArchive(archive, target) {
        // TODO: Make this platform independent!
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
        // TODO: Make this platform independent!
        if(process.platform === 'win32') {
            await this._executeCommand(`7z a "${archive}" "${source}"`);
        } else {
            //await this._executeCommand(`zip "${source}" -d "${archive}"`);
        }
    }

    /**
     * 
     * @param {*} file 
     * @param {*} data 
     * @param {*} gzip 
     */
    _saveFile(file, data, gzip) {
        this._createDirectoryChain(path.dirname(file));
        let content = gzip ? zlib.gzipSync(data, { level: 9 }) : data;
        fs.writeFileSync(file, content, typeof(content) === 'string' ? { encoding: 'utf8' } : undefined);
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
                    .catch(error => reject(error))
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
        await this._createDirectoryChain(directory); // await this._executeCommand(`mkdir -p "${directory}"`);
        await this._extractArchive(file, directory);
        await this._deleteFile(path.join(directory, 'version'));
        await this._deleteFile(path.join(directory, 'LICENSE'));
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
                    resolve();
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

        await this._deleteDirectoryRecursive(this._dirBuildRoot);
        await this._copySkeletonDEB();
        await this._bundleElectron();
        this._createManpage();
        this._createChangelog();
        //this._createMenuEntry(); // => only menu or desktop is recommend
        this._createDesktopShortcut();
        this._createControlDEB();
        this._createPostScript('postrm');
        this._createPostScript('postinst');
        await this._createChecksumsDEB();

        let deb = this._dirBuildRoot + '.deb';
        await this._deleteFile(deb);
        await this._executeCommand(`fakeroot dpkg-deb -v -b "${this._dirBuildRoot}" "${deb}"`);
        await this._executeCommand(`lintian --profile debian "${deb}" || true`);
    }

	/**
	 * 
	 */
    async buildRPM(architecture) {
        this._architecture = this.architectures[architecture];

        await this._validateCommands('unzip --help', 'asar --version', 'fakeroot --version', 'rpm --version');

        await this._deleteDirectoryRecursive(this._dirBuildRoot);
        await this._copySkeletonRPM();
        await this._bundleElectron();
        this._createManpage();
        this._createChangelog();
        //this._createMenuEntry(); // => only menu or desktop is recommend
        this._createDesktopShortcut();
        let specs = this._createSpecsRPM();

        let rpm = this._dirBuildRoot + '.rpm';
        await this._deleteFile(rpm);
        await this._executeCommand(`rpmbuild -bb --noclean --define "_topdir $(pwd)/${this._dirBuildRoot}" --define "buildroot %{_topdir}" "${specs}"`);
        await this._executeCommand(`mv -f ${this._dirBuildRoot}/RPMS/*/*.rpm ${rpm}`);
        await this._deleteFile(specs);
    }

    /**
     * 
     */
    async _bundleElectron() {
        console.log('Bundle electron ...');
        let folder = path.join(this._dirBuildRoot, 'usr/lib', this._configuration.name.package);
        await this._downloadElectron(this._configuration.version, this._architecture.platform, folder);
        await this._deleteFile(path.join(folder, 'resources', 'default_app.asar'));
        await this._executeCommand(`asar pack "src" "${folder}/resources/app.asar"`);
        await this._executeCommand(`mv "${folder}/electron" "${folder}/${this._configuration.binary.linux}"`);
        // remove executable flag from libraries => avoid lintian errors
        await this._executeCommand(`find "${folder}" -type f -iname "*.so" -exec chmod -x {} \\;`);
    }

    /**
     * 
     */
    async _copySkeletonDEB() {
        console.log('Copy DEB Skeleton ...');
        await this._executeCommand(`cp -r "redist/deb" "${this._dirBuildRoot}"`);
    }

    /**
     * 
     */
    async _copySkeletonRPM() {
        console.log('Copy RPM Skeleton ...');
        await this._executeCommand(`cp -r "redist/rpm" "${this._dirBuildRoot}"`);
    }

	/**
	 * 
	 */
	_createManpage() {
        console.log('Creating Manpage ...');
        let file = path.join(this._dirBuildRoot, 'usr/share/man/man1', this._configuration.name.package + '.1.gz');
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
        let file = path.join(this._dirBuildRoot, 'usr/share/doc', this._configuration.name.package, 'changelog.gz');
		this._saveFile(file, '-', true);
	}

	/**
	 * 
	 */
	_createDesktopShortcut() {
        console.log('Creating Desktop Shortcut ...');
        let file = path.join(this._dirBuildRoot, 'usr/share/applications', this._configuration.name.package + '.desktop');
		let content = [
			'[Desktop Entry]',
			'Version=1.0',
			'Type=' + this._configuration.meta.type,
			'Name=' + this._configuration.name.product,
			'GenericName=' + this._configuration.description.short,
			'Exec=' + path.join('/usr/lib', this._configuration.name.package, this._configuration.binary.linux),
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
        let file = path.join(this._dirBuildRoot, 'usr/share/menu', this._configuration.name.package);
		let content = [
            `?package(${this._configuration.name.package}):needs="X11" \\`,
            ` section="${this._configuration.meta.menu}" \\`,
            ` title="${this._configuration.name.product}" \\`,
            ` icon=\"/usr/share/pixmaps/${this._configuration.name.package}.xpm\" \\`,
            ` command="${path.join('/usr/lib', this._configuration.name.package, this._configuration.binary.linux)}"`
		];
		this._saveFile(file, content.join(eol), false);
	}

	/**
	 * 
	 */
	_createControlDEB() {
        console.log('Creating DEB Control File ...');
        let file = path.join(this._dirBuildRoot, 'DEBIAN/control');
		let content = [
			'Package: ' + this._configuration.name.package,
			'Version: ' + this._configuration.version,
			'Section: ' + this._configuration.meta.section,
			'Architecture: ' + this._architecture.name,
			'Installed-Size: ' + this._getSize(path.join(this._dirBuildRoot, 'usr')),
			'Depends: ' + this._configuration.meta.dependencies,
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
        let symbolic = path.join('/usr/bin', this._configuration.name.package);
        let binary = path.join('usr/lib', this._configuration.name.package, this._configuration.binary.linux);
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
	_createSpecsRPM() {
        console.log('Creating RPM Specification File ...');
        let file = 'build/specfile.spec';
        let symbolic = path.join('/usr/bin', this._configuration.name.package);
        let binary = path.join('usr/lib', this._configuration.name.package, this._configuration.binary.linux);
		let content = [
            'Name: ' + this._configuration.name.package,
			'Version: ' + this._configuration.version,
			'Release: 0',
			'License: ' + this._configuration.license,
			'URL: ' + this._configuration.url,
			'Requires: ' + this._configuration.meta.dependencies,
            'Summary: ' + this._configuration.description.short,
            '',
            'Autoreq: no',
            'AutoReqProv: no',
            '',
            '%description',
            this._configuration.description.long,
            '',
            '%files',
            '/usr',
            '',
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
                    name: 'i686',
                    suffix: 'windows-setup_i686',
                    platform: 'win32-ia32'
                },
                zip: {
                    name: 'i686',
                    suffix: 'windows-portable_i686',
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

        await this._deleteDirectoryRecursive(this._dirBuildRoot);
        await this._bundleElectron(false);
        await this._bundleFFMPEG(architecture === '64');
        await this._editResource();
        let setup = this._createScriptIS(architecture === '64');

        await this._executeCommand(`innosetup-compiler "${setup}"`);
        await this._deleteFile(setup);
    }

	/**
     * Create portable archive
     * @param {string} architecture 
     */
    async buildZIP(architecture) {
        this._architecture = this.architectures[architecture].zip;

        await this._validateCommands('7z --help', 'asar --version');

        await this._deleteDirectoryRecursive(this._dirBuildRoot);
        await this._bundleElectron(true);
        await this._bundleFFMPEG(architecture === '64');
        await this._editResource();
        // TODO: portable => upx compression ...

        let zip = this._dirBuildRoot + '.zip';
        await this._deleteFile(zip);
        await this._compressArchive('.\\' + this._dirBuildRoot, zip);
    }

    /**
     * 
     * @param {bool} portable 
     */
    async _bundleElectron(portable) {
        console.log('Bundle electron ...');
        let folder = this._dirBuildRoot;
        await this._downloadElectron(this._configuration.version, this._architecture.platform, folder);
        await this._deleteFile(path.join(folder, 'resources', 'default_app.asar'));
        if(portable) {
            this._saveFile(path.join(folder, this._configuration.binary.windows + '.portable'), 'Delete this File to disable Portable Mode');
        }
        await this._executeCommand(`asar pack "src" "${folder}\\resources\\app.asar"`);
        await this._executeCommand(`move /y "${folder}\\electron.exe" "${folder}\\${this._configuration.binary.windows}"`);
    }

    /**
     * 
     * @param {bool} is64 
     */
    async _bundleFFMPEG(is64) {
        console.log('Bundle FFmpeg ...');
        let ffmpeg = path.join('node_modules', 'ffmpeg-static', 'bin', 'win32');
        if(is64) {
            ffmpeg = path.join(ffmpeg, 'x64', 'ffmpeg.exe');
        } else {
            ffmpeg = path.join(ffmpeg, 'ia32', 'ffmpeg.exe');
        }
        // TODO: make platform independent ...
        await this._executeCommand(`copy /y "${ffmpeg}" "${this._dirBuildRoot}"`);
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
        let file = 'build\\setup.iss';
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
        await packager.buildRPM('64');
        await packager.buildRPM('32');
    }
    if(process.platform === 'darwin') {
        let packager = new ElectronPackagerDarwin(config);
        await packager.build('64');
    }
}

main();