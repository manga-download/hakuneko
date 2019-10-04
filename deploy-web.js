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

function validateEnvironment() {
    if(process.env.GITHUB_ACTOR === '') {
        throw new Error('Missing environment variable "GITHUB_ACTOR" providing the contributor name!');
    }
    if(process.env.GITHUB_TOKEN === '') {
        throw new Error('Missing environment variable "GITHUB_TOKEN" to provide access to the git repository!');
    }
    if(process.env.HAKUNEKO_PASSPHRASE === '') {
        throw new Error('Missing environment variable "HAKUNEKO_PASSPHRASE" to decrypt private key for signature!');
    }
}

/**
 * NOTE: same function as in build-web => merge
 * @param {string} identifier 
 */
async function gitStashPush(identifier) {
    identifier = identifier || 'HTDOCS#' + Date.now().toString(16).toUpperCase();
    await execute(`git stash push -u -m '${identifier}'`);
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
    let signature = await execute(`openssl dgst -sha256 -hex -sign ${key} -passin ${config.passphrase} ${archive} | cut -d' ' -f2`);
    await fs.writeFile(meta, `${archive}?signature=${signature}`);
    process.chdir(cwd);
}

/**
 * 
 */
async function gitCommit() {
    let user = process.env.GITHUB_ACTOR;
    let auth = Buffer.from(user + ':' + process.env.GITHUB_TOKEN).toString('base64');
    await execute(`git add ${config.deploy}/*`);
    await execute(`git -c user.name="${user}" commit -m 'Deployed Release: ${config.deploy}'`);
    await execute(`git -c http.extraheader="AUTHORIZATION: Basic ${auth}" push origin HEAD:${config.branch}`);
}

/**
 * 
 */
async function main() {
    try {
        validateEnvironment();
        let meta = 'latest';
        let archive = Date.now().toString(36).toUpperCase() + '.zip';
        await sslPack(archive, meta);
        await fs.remove(config.deploy);
        await fs.mkdir(config.deploy);
        await fs.move(path.resolve(config.build, meta), path.resolve(config.deploy, meta));
        await fs.move(path.resolve(config.build, archive), path.resolve(config.deploy, archive));
        let stashID = await gitStashPush();
        await execute(`git checkout ${config.branch} || git checkout -b ${config.branch}`);
        await execute(`git rm -r ${config.deploy}`);
        await gitStashPop(stashID);
        await gitCommit();
    } catch(error) {
        throw error;
    }
}

// exit application as soon as any uncaught exception is thrown
process.on('unhandledRejection', error => { throw error });
main();