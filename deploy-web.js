const path = require('path');
const fs = require('fs-extra');
const exec = require('child_process').exec;
const config = require('./deploy-web.config');

/**
 * NOTE: same function as in build-web => merge
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
 * NOTE: same function as in build-web => merge
 * @param {string} identifier 
 */
async function gitStashPush(glob, identifier) {
    identifier = identifier || 'HTDOCS#' + Date.now().toString(16).toUpperCase();
    await execute(`git stash push -u -m '${identifier}' ${glob}`);
    return identifier;
}

/**
 * NOTE: same function as in build-web => merge
 * @param {string} identifier 
 */
async function gitStashPop(identifier) {
    let out = await execute(`git stash list`);
    if(out.includes(identifier)) {
        await execute(`git stash pop`);
    }
}

/**
 * currently limited to unix systems only => TODO: use node modules instead of cmd tools
 * @param {string} archive 
 */
async function sslPack(archive, meta) {
    let key = path.resolve(config.key);
    let cwd = process.cwd();
    if(config.build) {
        process.chdir(config.build);
    }
    await execute(`zip -r ${archive} .`);
    let signature = await execute(`openssl dgst -sha256 -hex -sign ${key} ${archive} | cut -d' ' -f2`);
    await fs.writeFile(meta, `${archive}?signature=${signature}`);
    process.chdir(cwd);
}

/**
 * 
 */
async function gitCommit() {
    // TODO: provide user credentials to push changes
    await execute(`git add .`);
    await execute(`git commit -m 'deploy release: ${config.deploy}'`);
    await execute(`git push origin master`);
}

/**
 * 
 */
async function main() {
    let meta = 'latest';
    let archive = Date.now().toString(36).toUpperCase() + '.zip';
    await sslPack(archive, meta);
    await fs.remove(config.deploy);
    await fs.mkdir(config.deploy);
    await fs.move(path.resolve(config.build, meta), path.resolve(config.deploy, meta));
    await fs.move(path.resolve(config.build, archive), path.resolve(config.deploy, archive));
    let stashID = await gitStashPush(path.join(config.deploy, '*'));
    await execute(`git checkout gh-pages`);
    await gitStashPop(stashID);
    //await gitCommit();
}

// exit application as soon as any uncaught exception is thrown
process.on('unhandledRejection', error => { throw error });
main();