import Connector from '../engine/Connector.mjs';
import Manga from '../engine/Manga.mjs';

export default class CoroCoro extends Connector {
    constructor() {
        super();
        super.id = 'corocoro';
        super.label = '週刊コロコロコミック (Shuukan CoroCoro Comic)';
        this.tags = ['manga', 'japanese'];
        this.url = 'https://www.corocoro.jp';
        this.protoTypes = '/mjs/connectors/CoroCoro.proto';
    }

    async _initializeConnector() {
    }

    /**
     * @param {URL} uri
     */
    async _getMangaFromURI(uri) {
        const id = uri.pathname.split('/')[2];
        /** @type {HTMLHeadingElement[]} */
        const data = await this.fetchDOM(uri, 'main > div > div > section > div.grid > h1.font-bold');
        const title = data[0].innerText.trim();
        return new Manga(this, id, title);
    }

    /** @type {Connector['_getMangas']} */
    async _getMangas() {
        /** @type {HTMLScriptElement[]} */
        const scripts = await this.fetchDOM(this.url + '/rensai', 'script');
        for (const scriptElem of scripts.reverse()) {
            const script = scriptElem.innerText;
            try {
                /** @type {string} */
                const json = JSON.parse(script.substring(22, script.length - 2));
                /** @type {Object<string, {id: number, name: string}[]>} */
                const data = JSON.parse(json.substring(json.indexOf(':') + 1))[3]['children'][3]['weekdays'];
                return ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun']
                    .flatMap(weekday => data[weekday].map(manga => ({id: manga.id.toString(), title: manga.name})));
            } catch (e) {
                if (e instanceof SyntaxError || e instanceof TypeError) {
                    continue;
                }
                throw e;
            }
        }
    }

    /** @type {Connector['_getChapters']} */
    async _getChapters(manga) {
        const url = new URL('/api/csr', this.url);
        url.searchParams.set('rq', 'title/detail');
        url.searchParams.set('title_id', manga.id);
        const request = new Request(url, this.requestOptions);
        /** @type { { chapters: { id: string, mainName: string }[] } } */
        const data = await this.fetchPROTO(request, this.protoTypes, 'TitleDetailView');
        return data.chapters.map(chapter => ({id: chapter.id, title: chapter.mainName}));
    }

    /** @type {Connector['_getPages']} */
    async _getPages(chapter) {
        const url = new URL('/api/csr', this.url);
        url.searchParams.set('rq', 'chapter/viewer');
        url.searchParams.set('chapter_id', chapter.id);
        const request = new Request(url, {...this.requestOptions, method: 'PUT'});
        /** @type { { pages: { src: string }[], aesKey: string, aesIv: string } } */
        const data = await this.fetchPROTO(request, this.protoTypes, 'ViewerView');
        return data.pages.map(page => this.createConnectorURI({src: page.src, aesKey: data.aesKey, aesIv: data.aesIv}));
    }

    /**
     * @param {{src: string, aesKey: string, aesIv: string}} payload
     */
    async _handleConnectorURI(payload) {
        const encodedResponse = await fetch(payload.src);
        const encodedData = await encodedResponse.arrayBuffer();
        const key = CryptoJS.enc.Hex.parse(payload.aesKey);
        const iv = CryptoJS.enc.Hex.parse(payload.aesIv);
        const ciphertext = CryptoJS.lib.WordArray.create(encodedData);
        const encryptedCP = CryptoJS.lib.CipherParams.create({
            ciphertext: ciphertext,
            formatter: CryptoJS.format.OpenSSL
        });
        const decryptedWA = CryptoJS.AES.decrypt(encryptedCP, key, {
            iv: iv
        });
        const mimeBuffer = {
            mimeType: undefined,
            data: this.convertWordArrayToUint8Array(decryptedWA),
        };
        this._applyRealMime(mimeBuffer);
        return mimeBuffer;
    }

    convertWordArrayToUint8Array(wordArray) {
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
}
