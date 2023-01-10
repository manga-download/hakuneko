import ZYMK from './templates/ZYMK.mjs';

export default class CocoManHua extends ZYMK {

    constructor() {
        super();
        super.id = 'cocomanhua';
        super.label = 'Coco漫画';
        this.tags = [ 'webtoon', 'chinese' ];
        this.url = 'https://www.colamanhua.com';
        this.path = '/show?page=';
        this.pathSuffix = '';
        this.queryMangaTitle = 'dl.fed-deta-info dd.fed-deta-content h1.fed-part-eone';
        this.queryMangasPageCount = 'div.fed-page-info a.fed-show-sm-inline';
        this.queryMangas = 'ul.fed-list-info li.fed-list-item a.fed-list-title';
        this.queryChapters = 'div.all_data_list ul li a';
        this.config.throttle = {
            label: 'Throttle Requests [ms]',
            description: 'Enter the timespan in [ms] to delay consecuitive HTTP requests.\nThe website may block images for to many consecuitive requests.',
            input: 'numeric',
            min: 50,
            max: 1000,
            value: 250
        };
    }

    async _getPages(chapter) {
        const script = `
        new Promise((resolve, reject) => {
            let decrypt = function (key, message) {
                var s = CryptoJS.enc.Utf8.parse(key),
                t = CryptoJS.AES.decrypt(message, s, {
                    mode: CryptoJS.mode.ECB,
                    padding: CryptoJS.pad.Pkcs7,
                })
                return CryptoJS.enc.Utf8.stringify(t).toString()
            }
            let totalimgs = 0;
            try {
                totalimgs = decrypt('hxPLjUZQgfZQT70x', CryptoJS.enc.Base64.parse(window.mh_info.enc_code1).toString(CryptoJS.enc.Utf8));
                if (totalimgs == '') {
                    totalimgs = decrypt('EJJFAD6P2BtTrEN3', CryptoJS.enc.Base64.parse(window.mh_info.enc_code1).toString(CryptoJS.enc.Utf8));
                }
                totalimgs = parseInt(totalimgs);
                if (String(totalimgs) == 'NaN') {
                    totalimgs = decrypt('EJJFAD6P2BtTrEN3', CryptoJS.enc.Base64.parse(window.mh_info.enc_code1).toString(CryptoJS.enc.Utf8));
                }
            }
            catch (error) {
                totalimgs = decrypt('EJJFAD6P2BtTrEN3', CryptoJS.enc.Base64.parse(window.mh_info.enc_code1).toString(CryptoJS.enc.Utf8));
                totalimgs = parseInt(totalimgs);
            }
            let picz = [];
            for( let i = 1 ; i <= totalimgs; i++) {
                picz.push(__cr.getPicUrl(i));
            }
            //get key for picture decryption
            let realKey = CryptoJS.enc.Utf8.parse(decrypt('EhhTOJE2zA9u7vYT', window.image_info.imgKey));
            resolve({
                images : picz, key : realKey
            });
        });
        `;
        const uri = new URL(chapter.id, this.url);
        let request = new Request(uri, this.requestOptions);
        const data = await Engine.Request.fetchUI(request, script, 30000);
        return data.images.map(image => this.createConnectorURI( {
            url : new URL(image, this.url).href, key : data.key})
        );
    }

    async _handleConnectorURI(payload) {
        const request = new Request(payload.url, this.requestOptions);
        request.headers.set('x-referer', this.url);
        request.headers.set('x-origin', this.url);
        const response = await fetch(request);
        let buffer = undefined;
        if (payload.key.sigBytes != 0) {
            let encrypted = new Uint8Array(await response.arrayBuffer());
            buffer = {
                mimeType: response.headers.get('content-type'),
                data: await this._decryptPicture(encrypted, payload.key)
            };
        } else {
            buffer = await response.blob();
            buffer = await this._blobToBuffer(buffer);
        }
        this._applyRealMime(buffer);
        return buffer;
    }

    async _decryptPicture(data, key) {
        let G = key;
        let H = this.convertUint8ArrayToWordArray(new Uint8Array(data));
        let I = {
            'ciphertext' : H};
        const options = {
            iv : CryptoJS.enc.Utf8.parse('0000000000000000'),
            mode : CryptoJS.mode.CBC,
            padding : CryptoJS.pad.Pkcs7
        };
        return this.convertWordArrayToUint8Array(CryptoJS.AES.decrypt(I, G, options));
    }

    convertWordArrayToUint8Array (wordArray) {
        var len = wordArray.words.length,
            u8_array = new Uint8Array(len << 2),
            offset = 0,
            word,
            i;
        for (i = 0; i < len; i++) {
            word = wordArray.words[i];
            u8_array[offset++] = word >> 24;
            u8_array[offset++] = word >> 16 & 255;
            u8_array[offset++] = word >> 8 & 255;
            u8_array[offset++] = word & 255;
        }
        return u8_array;
    }

    convertUint8ArrayToWordArray(u8Array) {
        var words = [],
            i = 0,
            len = u8Array.length;
        while (i < len) {
            words.push(u8Array[i++] << 24 | u8Array[i++] << 16 | u8Array[i++] << 8 | u8Array[i++]);
        }
        return {
            sigBytes: words.length * 4,
            words: words
        };
    }
}
