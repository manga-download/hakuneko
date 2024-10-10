import Chapter from '../engine/Chapter.mjs';
import Connector from '../engine/Connector.mjs';
import Manga from '../engine/Manga.mjs';

const weekdays = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];

function unhex(hex) {
    return new Uint8Array(hex.match(/../g).map(byte => parseInt(byte, 16)));
}

export default class CoroCoro extends Connector {
    constructor() {
        super();
        super.id = 'corocoro';
        super.label = '週刊コロコロコミック (Shuukan CoroCoro Comic)';
        this.tags = ['manga', 'japanese'];
        this.url = 'https://www.corocoro.jp';
    }

    /**
     * @param {URL} uri
     */
    async _getMangaFromURI(uri) {
        if (uri.pathname.startsWith('/title/')) {
            const id = uri.pathname.substring('/title/'.length);
            /** @type {HTMLHeadingElement[]} */
            const data = await this.fetchDOM(uri, 'h1');
            const title = data[0].innerText.trim();
            return new Manga(this, id, title);
        }
        if (uri.pathname.startsWith('/chapter/')) {
            const scripts = await this.fetchDOM(uri, 'script');
            for (const scriptElem of scripts.reverse()) {
                const script = scriptElem.innerText;
                try {
                    /** @type {string} */
                    const json = JSON.parse(script.substring(22, script.length - 2));
                    /** @type {{chapterListSection: {titleName: string}, viewerSection: {titleID: number}}} */
                    const data = JSON.parse(json.substring(json.indexOf(':') + 1))[3]['children'][0][3];
                    const id = data.viewerSection.titleID.toString();
                    const title = data.chapterListSection.titleName;
                    return new Manga(this, id, title);
                } catch (e) {
                    if (e instanceof SyntaxError || e instanceof TypeError) {
                        continue;
                    }
                    throw e;
                }
            }
        }
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
                return weekdays.flatMap(weekday => data[weekday].map(manga => new Manga(this, manga.id.toString(), manga.name)));
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
        const scripts = await this.fetchDOM(this.url + '/title/' + manga.id, 'script');
        for (const scriptElem of scripts.reverse()) {
            const script = scriptElem.innerText;
            try {
                /** @type {string} */
                const json = JSON.parse(script.substring(22, script.length - 2));
                /** @type {Object<string, {id: number, title: string}[]>} */
                const data = JSON.parse(json.substring(json.indexOf(':') + 1))[3]['children'][0][3]['children'][1][3]['section']['chapters'];
                return ['earlyChapters', 'omittedMiddleChapters', 'latestChapters']
                    .flatMap(key =>
                        data[key].map(chapter => new Chapter(manga, chapter.id.toString(), chapter.title, ''))
                    );
            } catch (e) {
                if (e instanceof SyntaxError || e instanceof TypeError) {
                    continue;
                }
                throw e;
            }
        }
    }

    /** @type {Connector['_getPages']} */
    async _getPages(chapter) {
        const scripts = await this.fetchDOM(this.url + '/chapter/' + chapter.id, 'script');
        for (const scriptElem of scripts.reverse()) {
            const script = scriptElem.innerText;
            try {
                /** @type {string} */
                const json = JSON.parse(script.substring(22, script.length - 2));
                /** @type {{src: string, crypto: {method: string, key: string, iv: string}}[]} */
                const data = JSON.parse(json.substring(json.indexOf(':') + 1))[3]['children'][0][3]['viewerSection']['pages'];
                return data.map(page => this.createConnectorURI(page));
            } catch (e) {
                if (e instanceof SyntaxError || e instanceof TypeError) {
                    continue;
                }
                throw e;
            }
        }
    }

    /**
     * @param {{src: string, crypto: {method: string, key: string, iv: string}}} payload
     */
    async _handleConnectorURI(payload) {
        const encodedResponse = await fetch(payload.src);
        const encodedData = await encodedResponse.arrayBuffer();
        const ext = payload.src.substring(payload.src.lastIndexOf('.', payload.src.indexOf('.enc') - 1) + 1, payload.src.indexOf('.enc'));
        const mimeType = 'image/' + (ext === 'jpg' ? 'jpeg' : ext);
        if (payload.crypto.method !== 'aes-cbc') {
            throw new Error(`Unsupported encoding method: ${payload.crypto.method}`);
        }
        const algo = {
            name: 'AES-CBC',
            iv: unhex(payload.crypto.iv),
        };
        const cryptoKey = await crypto.subtle.importKey('raw', unhex(payload.crypto.key), algo, false, ['decrypt']);
        const data = await crypto.subtle.decrypt(algo, cryptoKey, encodedData);
        const mimeBuffer = {
            mimeType,
            data: new Uint8Array(data),
        };
        this._applyRealMime(mimeBuffer);
        return mimeBuffer;
    }
}
