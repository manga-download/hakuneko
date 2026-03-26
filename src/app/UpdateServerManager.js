const url = require('url');
const http = require('http');
const https = require('https');
const { ConsoleLogger } = require('@logtrine/logtrine');
const UpdatePackageInfo = require('./UpdatePackageInfo');

module.exports = class UpdateServerManager {

    constructor(applicationUpdateURL, logger) {
        try {
            this._logger = logger || new ConsoleLogger(ConsoleLogger.LEVEL.Warn);
            // NOTE: simple hack to check if URL is valid (must not throw error)
            url.parse(applicationUpdateURL, true).hostname.length;
            this._applicationUpdateURL = applicationUpdateURL;
        } catch(error) {
            this._logger.warn('Initialization of "UpdateServerManager" failed!', error);
            this._applicationUpdateURL = undefined;
        }
    }

    /**
     *
     * @param {string | URL | RequestOptions} options
     */
    _getClient(options) {
        let uri = '';
        if(typeof options === 'string') {
            uri = options;
        }
        if(typeof options['href'] === 'string') {
            uri = options['href'];
        }
        if(typeof options['url'] === 'string') {
            uri = options['url'];
        }
        return uri.startsWith('https:') ? https : http;
    }

    /**
     * Download content via HTTP(S).
     * @param {string | URL | RequestOptions} options
     */
    _request(options) {
        return new Promise((resolve, reject) => {
            if(!options) {
                throw new Error('Invalid request for connection to the update server!');
            }
            let request = this._getClient(options).request(options, response => {
                if(response.headers.location && response.headers.location.startsWith('http')) {
                    this._request(response.headers.location)
                        .then(data => resolve(data))
                        .catch(error => reject(error));
                    return;
                }
                if(response.statusCode !== 200) {
                    reject(new Error('Status: ' + response.statusCode));
                    return;
                }
                let data = [];
                //response.setEncoding('utf8');
                response.on('data', chunk => data.push(chunk));
                response.on('end', () => resolve(Buffer.concat(data)));
            } );
            request.on('error', error => reject(error));
            //request.write(/* REQUEST BODY */);
            request.end();
        });
    }

    /**
     * @returns {Promise<UpdatePackageInfo>}
     */
    getUpdateInfo() {
        return this._request(this._applicationUpdateURL)
            .then(data => {
                let link = data.toString('utf8').trim();
                let info = new UpdatePackageInfo(link.split('.')[0], url.parse(link, true).query.signature, url.resolve(this._applicationUpdateURL, link));
                return Promise.resolve(info);
            });
    }

    /**
     *
     * @param {UpdatePackageInfo} info The update package information received with getUpdateInfo()
     * @returns {Promise<Uint8Array>} A promise that resolves with the received bytes
     */
    getUpdateArchive(info) {
        return this._request(info.link);
    }
};