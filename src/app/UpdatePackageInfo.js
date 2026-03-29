const crypto = require('crypto');

module.exports = class UpdatePackageInfo {

    constructor(version, signature, link) {
        this.version = version;
        this.signature = signature;
        this.link = link;
    }

    /**
     * Validates that the given data is correctly signed.
     * @param {Uint8Array | Buffer} data The package data to be validated
     * @param {string} pubkey The public key that shall be used to decrypted the signature
     * @returns {Promise} A promise that will resolve with the given data if verification succeeds, otherwise reject with a related error
     */
    validate(data, pubkey) {
        return new Promise(resolve => {
            let validator = crypto.createVerify('RSA-SHA256');
            validator.update(data);
            if(validator.verify(pubkey, Buffer.from(this.signature, 'hex'))) {
                resolve(data);
            } else {
                throw new Error('Integrity check of update failed! The signature does not match the update package.');
            }
        });
    }
};