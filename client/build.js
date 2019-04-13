const fs = require('fs');
const path = require('path');
const zlib = require('zlib');
const https = require('https');
const exec = require('child_process').exec;
const config = require('../build.config');

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
    build(architecture, portable) {
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
     * @param {*} directory 
     */
    _deleteDirectoryRecursive(directory) {
        // TODO: Make this platform independent!
        return this._executeCommand(`rm -r -f "${directory}"`)
        .then(() => console.log('Directory Deleted:', directory));
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
        // TODO: Make this platform independent!
        await this._executeCommand(`mkdir -p "${directory}"`); // await this._createDirectoryChain(directory);
        await this._executeCommand(`unzip "${file}" -d "${directory}"`);
        await this._executeCommand(`rm -f "${directory}/version"`);
        await this._executeCommand(`rm -f "${directory}/LICENSE"*`);
    }

    /**
     * 
     */
    _executeCommand(command) {
        console.log('>', command);
        return new Promise((resolve, reject) => {
            exec(command, (error, stdout, stderr) => {
                console.log(stdout);
                console.log(stderr);
                if(error) {
                    reject(error);
                } else {
                    resolve();
                }
            });
        });
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
	async build(architecture, portable) {
		await this.buildDEB(architecture);
		await this.buildRPM(architecture);
	}

	/**
	 * 
	 */
    async buildDEB(architecture) {
		this._architecture = this.architectures[architecture];
        let folder = this._dirBuildRoot;
        console.log('Cleanup Build Root:', folder);
        await this._executeCommand(`rm -r -f "${folder}"`); // await this._deleteDirectoryRecursive(folder);
        console.log('Copy DEB Skeleton ...');
        await this._executeCommand(`cp -r "redist/deb/" "${folder}"`);
        folder = path.join(this._dirBuildRoot, 'usr/lib', this._configuration.name.package);
        await this._downloadElectron(this._configuration.version, this._architecture.platform, folder);

        await this._executeCommand(`rm -r -f "${folder}/resources/default_app.asar"`);
        await this._executeCommand(`asar pack "src" "${folder}/resources/app.asar"`);
        await this._executeCommand(`mv "${folder}/electron" "${folder}/${this._configuration.binary.linux}"`);
    
        this._createManpage();
        this._createChangelog();
        this._createDesktopShortcut();
        //this._createMenuEntry();
        this._createControlDEB();
        await this._createChecksumsDEB();

        let deb = this._dirBuildRoot + '.deb';

        await this._executeCommand(`rm -f "${deb}"`);
        await this._executeCommand(`fakeroot dpkg-deb -v -b "${this._dirBuildRoot}" "${deb}"`);
        await this._executeCommand(`lintian --profile debian "${deb}"`);
        
        console.log('Package Creation Complete:', deb);
    }

	/**
	 * 
	 */
    async buildRPM(architecture) {
		this._architecture = this.architectures[architecture];
        let electron = await this._downloadElectron(this._configuration.version, this._architecture.platform);

        console.log('Preparing RPM Package ...');

        // ...

        console.log('Package Creation Complete:', 'xxx.rpm');
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
		].join('\n');
		this._saveFile(file, content, true);
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
			'Exec=' + this._configuration.name.package,
			'Icon=' + this._configuration.name.package,
			'Categories=' + this._configuration.meta.categories
		].join('\n');
		this._saveFile(file, content, false);
	}

	/**
	 * 
	 */
	_createMenuEntry() {
        console.log('Creatng Menu Entry');
        let file = path.join(this._dirBuildRoot, 'usr/share/menu', this._configuration.name.package);
		this._saveFile(file, '', false);
		/*
		echo "?package(${PACKAGE}): \\" > "build/$1/usr/share/menu/${PACKAGE}"
		echo "needs=\"X11\" \\" >> "build/$1/usr/share/menu/${PACKAGE}"
		echo "section=\"Applications/Network/File Transfer\" \\" >> "build/$1/usr/share/menu/${PACKAGE}"
		echo "title=\"${PRODUCT}\" \\" >> "build/$1/usr/share/menu/${PACKAGE}"
		echo "longtitle=\"${DESCRIPTION_SHORT}\" \\" >> "build/$1/usr/share/menu/${PACKAGE}"
		echo "icon=\"/usr/share/pixmaps/${PACKAGE}.xpm\" \\" >> "build/$1/usr/share/menu/${PACKAGE}"
		echo "command=\"/usr/bin/${PACKAGE}\"" >> "build/$1/usr/share/menu/${PACKAGE}"
		*/
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
		].join('\n');
		this._saveFile(file, content, false);
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
        console.log('Creating RPM Specification File ...')
		/*
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
		*/
	}
}

/**
 * 
 */
function main() {
    if(process.platform === 'win32') {
        let packager = new ElectronPackagerWindows(config);
        packager.buildISS('64');
        packager.buildISS('32');
        packager.buildZIP('64');
        packager.buildZIP('32');
    }
    if(process.platform === 'linux') {
        let packager = new ElectronPackagerLinux(config);
        packager.buildDEB('64');
        //packager.buildDEB('32');
        //packager.buildRPM('64');
        //packager.buildRPM('32');
    }
    if(process.platform === 'darwin') {
        let packager = new ElectronPackagerDarwin(config);
        packager.build('64');
    }
}

main();