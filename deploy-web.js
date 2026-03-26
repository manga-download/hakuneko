const path = require('path');
const fs = require('fs-extra');
const exec = require('child_process').exec;
const config = require('./deploy-web.config');

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
    if(!process.env.GITHUB_ACTOR) {
        throw new Error('Missing environment variable "GITHUB_ACTOR" providing the contributor name!');
    }
    if(!process.env.GITHUB_TOKEN) {
        throw new Error('Missing environment variable "GITHUB_TOKEN" to provide access to the git repository!');
    }
    if(!process.env.HAKUNEKO_PASSPHRASE) {
        throw new Error('Missing environment variable "HAKUNEKO_PASSPHRASE" to decrypt private key for signature!');
    }
}

async function gitStashPush(identifier) {
    identifier = identifier || 'HTDOCS#' + Date.now().toString(16).toUpperCase();
    await execute(`git stash push -u -m '${identifier}'`);
    return identifier;
}

async function gitStashPop(identifier) {
    let out = await execute(`git stash list`);
    if(out.includes(identifier)) {
        await execute(`git stash pop`);
    }
}

async function sslPack(archive, meta) {
    let key = path.resolve(config.key);
    let cwd = process.cwd();
    if(config.build) {
        process.chdir(config.build);
    }
    await execute(`zip -r ${archive} . > /dev/null`);
    let signature = await execute(`openssl dgst -sha256 -hex -sign ${key} -passin ${config.passphrase} ${archive} | cut -d' ' -f2`);
    await fs.writeFile(meta, `${archive}?signature=${signature}`);
    process.chdir(cwd);
}

async function gitCommit() {
    let user = process.env.GITHUB_ACTOR;
    let mail = user + '@users.noreply.github.com';
    let auth = Buffer.from('x-access-token:' + process.env.GITHUB_TOKEN).toString('base64');
    await execute(`git add ${config.directory}/*`);
    await execute(`git -c user.name="${user}" -c user.email="${mail}" commit -m 'Deployed Release: ${config.directory}'`);
    await execute(`git -c http.extraheader="AUTHORIZATION: Basic ${auth}" push origin HEAD:${config.branch}`);
    // NOTE: Workaround to trigger page build (which is not done for public repositories by the commit above)
    // https://developer.github.com/v3/repos/pages/#request-a-page-build
    // See:
    // - https://github.community/t5/GitHub-Actions/Github-action-not-triggering-gh-pages-upon-push/td-p/26869
    // - https://github.com/peaceiris/actions-gh-pages/issues/9
    let uri = `https://api.github.com/repos/manga-download/hakuneko/pages/builds`;
    await execute(`curl --silent -L -X POST -H "Content-Type: application/json" -H "Authorization: TOKEN ${process.env.HAKUNEKO_TOKEN}" ${uri}`)
}

async function main() {
    validateEnvironment();
    let meta = 'latest';
    let archive = Date.now().toString(36).toUpperCase() + '.zip';
    await sslPack(archive, meta);
    await fs.remove(config.directory);
    await fs.mkdir(config.directory);
    await fs.move(path.resolve(config.build, meta), path.resolve(config.directory, meta));
    await fs.move(path.resolve(config.build, archive), path.resolve(config.directory, archive));
    let stashID = await gitStashPush();
    await execute(`git fetch origin ${config.branch}`); // await execute(`git -c protocol.version=2 fetch --no-tags --prune --progress --no-recurse-submodules --depth=1 origin +gh-pages:refs/remotes/origin/gh-pages`);
    await execute(`git checkout ${config.branch}`); // await execute(`git checkout --progress --force -B gh-pages refs/remotes/origin/gh-pages`);
    await execute(`git rm -r ${config.directory} || true`);
    await gitStashPop(stashID);
    await gitCommit();
}

// exit application as soon as any uncaught exception is thrown
process.on('unhandledRejection', error => { throw error; });
main();