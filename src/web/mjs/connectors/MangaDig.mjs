import ZYMK from './templates/ZYMK.mjs';

export default class MangaDig extends ZYMK {

    constructor() {
        super();
        super.id = 'mangadig';
        super.label = 'MangaDig';
        this.tags = [ 'webtoon', 'engish', 'manga' ];
        this.url = 'https://mangadig.com';
        this.path = '/show?page=';
        this.pathSuffix = '';
        this.queryMangas = 'ul.fed-list-info li.fed-list-item a.fed-list-title';
        this.queryMangasPageCount = 'div.fed-page-info a.fed-show-sm-inline';
        this.queryChapters = 'div.all_data_list ul li a';
        this.queryMangaTitle = 'dl.fed-deta-info dd.fed-deta-content h1.fed-part-eone';
    }

    async _getPages(chapter) {
        const script = `
        new Promise((resolve, reject) => {
            const keyArr1 = ['Nmep5vdPVnWMHSbS', '28WEasYo2qX4ULqG'];    //for C_DATA DECRYPTION and imagekey decryption
            const keyArr2 = ['EJJFAD6P2BtTrEN3', 'kY4BI9dUmb05U40X'];   //for mh_info.enc_code1 decryption
            let decrypt = function (p, q) {
                var s = CryptoJS.enc.Utf8.parse(p),
                t = CryptoJS.AES.decrypt(q, s, {
                    mode: CryptoJS.mode.ECB,
                    padding: CryptoJS.pad.Pkcs7,
                })
                return CryptoJS.enc.Utf8.stringify(t).toString()
            }
            let wrapper_decrypt = function (ciphertext, keyArr, b64 = true) {
                let result = '';
                for (var index = 0 ; index < keyArr.length; index++) {
                    try {
                        ciphertext = b64 ? CryptoJS.enc.Base64.parse(ciphertext).toString(CryptoJS.enc.Utf8) : ciphertext;
                        result = decrypt(keyArr[index], ciphertext);
                        if (result != '') break;
                    }
                    catch (e) {
                    }
                }
                return result;
            }
            let totalimgs = wrapper_decrypt(mh_info.enc_code1, keyArr2);
            let picz = [];
            for( let i = 1 ; i <= totalimgs; i++) {
                picz.push(__cr.getPicUrl(i));
            }
            //get key for picture decryption
            let realKey = image_info.imgKey;
            realKey = wrapper_decrypt(realKey, keyArr1, false);
            realKey = CryptoJS.enc.Utf8.parse(realKey);
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
        let buffer = '';
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
        let I = { 'ciphertext' : H};
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