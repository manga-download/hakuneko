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
    let cwd = process.cwd();
    if(config.build) {
        process.chdir(config.deploy);
    }
    await execute(`git add .`);
    await execute(`git commit -m 'updated releases'`);
    await execute(`git push origin master`);
    process.chdir(cwd);
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
    await fs.move(path.resolve(config.source, meta), path.resolve(config.deploy, meta));
    await fs.move(path.resolve(config.source, archive), path.resolve(config.deploy, archive));
    // git stash directory `config.deploy`
    // switch to gh-pages branch
    // pop stash `config.deploy`
    //await gitCommit();
}

// exit application as soon as any uncaught exception is thrown
process.on('unhandledRejection', error => { throw error });
main();