const path = require('path');
const fs = require('fs-extra');
const exec = require('child_process').exec;
const vinyl = require('vinyl-fs');
const mergeStream = require('merge-stream');
const PolymerProject = require('polymer-build').PolymerProject;
const config = require('./build-web.config');
config.source = config.source || 'src';
config.target = config.target || 'build';

/**
 * 
 * @param {string} command 
 * @param {bool} silent 
 */
function execute(command, silent) {
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
 */
async function gitHead() {
    let rev = (await execute(`git log -1 --format="%H"`)).trim();
    return {
        revision: rev,
        version: rev.slice(0, 6)
    }
}

/**
 * 
 * @param {string} identifier 
 */
async function gitStashPush(identifier) {
    identifier = identifier || 'DEPLOY#' + Date.now().toString(16).toUpperCase();
    await execute(`git stash push -u -m '${identifier}'`);
    return identifier;
}

/**
 * 
 * @param {string} identifier 
 */
async function gitStashPop(identifier) {
    let out = await execute(`git stash list`);
    if(out.includes(identifier)) {
        await execute(`git stash pop`);
    }
}

/**
 * 
 * @param {NodeJS.ReadableStream} streamReader 
 * @param {NodeJS.WritableStream} streamWriter 
 */
function pipe(streamReader, streamWriter) {
    return new Promise((resolve, reject) => {
        let stream = streamReader.pipe(streamWriter);
        stream.on('error', reject);
        stream.on('end', resolve);
    });
}

/**
 * 
 */
async function polymerBuild(settings) {
    let target = path.resolve(config.target);
    let cwd = process.cwd();
    if(config.source) {
        process.chdir(config.source);
    }

    let project = new PolymerProject(settings);
    let streamIn = mergeStream(project.sources(), project.dependencies());
    let streamOut = vinyl.dest(target);
    await pipe(streamIn, streamOut);

    process.chdir(cwd);
}

/**
 * 
 * @param {string} revision 
 * @param {string} version 
 */
async function createVersion(file, revision, version) {
    let content = [
        `<script>`,
        `    var revision = {`,
        `        id: '${version}',`,
        `        url: 'https://github.com/manga-download/hakuneko/commits/${revision}'`,
        `    };`,
        `</script>`
    ].join('\n');
    await fs.writeFile(file, content);
}

/**
 * 
 */
async function main() {
    let head = await gitHead();
    let stashID = await gitStashPush();
    await fs.remove(config.target);
    await polymerBuild(config.polymer);
    // overwrite the polymer minified/obfuscated js files with the original minified/obfuscated js files (e.g. prevent breaking hls.light.min.js when minified by polymer)
    //cp -f ./js/*.min.js $DIR/js/
    // polymer will break files that are already obfuscated, so use the original obfuscated files => otherwise leads to blank/white screen + out-of-memory error in electron
    //cp -f ./lib/hakuneko/engine/base/connectors/mangago.html $DIR/lib/hakuneko/engine/base/connectors/mangago.html
    //cp -f ./lib/hakuneko/engine/base/connectors/tencentcomic.html $DIR/lib/hakuneko/engine/base/connectors/tencentcomic.html
    await createVersion(path.join(config.target, config.version), head.revision, head.version);
    await gitStashPop(stashID);
}

// exit application as soon as any uncaught exception is thrown
process.on('unhandledRejection', error => { throw error });
main();