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
    if(config.source) {
        process.chdir(config.source);
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
    await execute(`git add .`);
    await execute(`git commit -m 'updated releases'`);
    await execute(`git push origin master`);
}

/**
 * 
 */
async function main() {
    let meta = 'latest';
    let archive = Date.now().toString(36).toUpperCase() + '.zip';
    await sslPack(archive, meta);
    await fs.remove(config.target);
    await fs.mkdir(config.target);
    await fs.move(path.resolve(config.source, meta), path.resolve(config.target, meta));
    await fs.move(path.resolve(config.source, archive), path.resolve(config.target, archive));
    gitCommit();
}

main();