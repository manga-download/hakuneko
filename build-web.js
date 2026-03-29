const path = require('path');
const fs = require('fs-extra');
const exec = require('child_process').exec;
const vinyl = require('vinyl-fs');
const mergeStream = require('merge-stream');
const PolymerProject = require('polymer-build').PolymerProject;
const config = require('./build-web.config');
config.source = config.source || 'src';
config.target = config.target || 'build';

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

async function gitStashPush(identifier) {
    identifier = identifier || 'DEPLOY#' + Date.now().toString(16).toUpperCase();
    await execute(`git stash push -u -m '${identifier}'`);
    return identifier;
}

async function gitStashPop(identifier) {
    let out = await execute(`git stash list`);
    if(out.includes(identifier)) {
        await execute(`git stash pop`);
    }
}

function pipe(streamReader, streamWriter) {
    return new Promise((resolve, reject) => {
        let stream = streamReader.pipe(streamWriter);
        stream.on('error', reject);
        stream.on('end', resolve);
    });
}

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

async function createVersionInfo(file) {
    let branch = /*process.env.GITHUB_REF ? process.env.GITHUB_REF.split('/').pop() : */(await execute(`git rev-parse --abbrev-ref HEAD`)).trim();
    let revision = (await execute(`git rev-parse HEAD`)).trim();
    let content = [
        `export default {`,
        `    branch: {`,
        `        label: '${branch}',`,
        `        link: 'https://github.com/manga-download/hakuneko/commits/${branch}',`,
        `    },`,
        `    revision: {`,
        `        label: '${revision.slice(0, 6)}',`,
        `        link: 'https://github.com/manga-download/hakuneko/commits/${revision}',`,
        `    }`,
        `};`
    ].join('\n');
    await fs.writeFile(file, content);
}

async function main() {
    let stashID = await gitStashPush();
    await fs.remove(config.target);
    await polymerBuild(config.polymer);
    await createVersionInfo(path.join(config.target, config.version));
    await gitStashPop(stashID);
}

// exit application as soon as any uncaught exception is thrown
process.on('unhandledRejection', error => { throw error; });
main();