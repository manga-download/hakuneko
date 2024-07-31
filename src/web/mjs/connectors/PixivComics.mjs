import Connector from '../engine/Connector.mjs';
import Manga from '../engine/Manga.mjs';

export default class PixivComics extends Connector {

    constructor() {
        super();
        this.id = 'pixivcomics';
        this.label = 'pixivコミック';
        this.tags = [ 'manga', 'japanese' ];
        this.url = 'https://comic.pixiv.net';
        this.links = {
            login: 'https://accounts.pixiv.net/login'
        };
        this.apiURL = 'https://comic.pixiv.net/api/app/';
        this.requestOptions.headers.set('x-referer', this.url);
        this.requestOptions.headers.set('x-requested-with', 'pixivcomic');
    }

    async _getMangaFromURI(uri) {
        const request = new Request(new URL('works/v5/' + uri.pathname.match(/\d+$/)[0], this.apiURL), this.requestOptions);
        const data = await this.fetchJSON(request);
        const id = data.data.official_work.id;
        const title = data.data.official_work.name.trim();
        return new Manga(this, id, title);
    }

    async _getMangas() {
        let mangaList = [];
        const uri = new URL('magazines', this.apiURL);
        const request = new Request(uri, this.requestOptions);
        const data = await this.fetchJSON(request);
        const pages = data.data.magazines.map(item => item.id);
        for (let page of pages) {
            let mangas = await this._getMangasFromPage(page);
            mangaList.push(...mangas);
        }
        return mangaList;
    }

    async _getMangasFromPage(page) {
        const uri = new URL(`magazines/v2/${page}/works`, this.apiURL);
        const request = new Request(uri, this.requestOptions);
        const data = await this.fetchJSON(request);
        return data.data.official_works.map(item => {
            return {
                id: item.id,
                title: item.title.trim()
            };
        });
    }

    async _getChapters(manga) {
        let chapterList = [];
        for (let page = 1, run = true; run; page++) {
            const chapters = await this._getChaptersFromPage(manga.id, page);
            chapters.length > 0 ? chapterList.push(...chapters) : run = false;
        }
        return chapterList;
    }

    async _getChaptersFromPage(mangaId, page) {
        const uri = new URL(`works/${mangaId}/episodes?page=${page}`, this.apiURL);
        const request = new Request(uri, this.requestOptions);
        const { data } = await this.fetchJSON(request);
        return data.episodes
            .filter(item => item.readable)
            .map(item => {
                return {
                    id: item.episode.id, // this.getRootRelativeOrAbsoluteLink(element, request.url),
                    title: item.episode.numbering_title + (!item.episode.sub_title ? '' : ' - ' + item.episode.sub_title), // element.text.trim(),
                    language: ''
                };
            });
    }

    async _getPages(chapter) {
        const timestamp = new Date().toISOString().replace(/\.\d+Z$/, 'Z');
        const hash = CryptoJS.SHA256(timestamp + '4yX5JnooikMsznkIF2Pc1zDCoMmKJdJj27HPrSyEVzgmepcghvumFihiv0LAK0Se').toString(CryptoJS.enc.Hex);
        const uri = new URL(`episodes/${chapter.id}/read_v4`, this.apiURL);
        const request = new Request(uri, this.requestOptions);
        request.headers.set('x-requested-with', 'pixivcomic');
        request.headers.set('x-client-time', timestamp);
        request.headers.set('x-client-hash', hash);
        const data = await this.fetchJSON(request);
        return data.data.reading_episode.pages.map(image => this.createConnectorURI(image));
    }

    async _handleConnectorURI(payload) {
        let request = new Request(payload.url, this.requestOptions);
        request.headers.set('X-Cobalt-Thumber-Parameter-GridShuffle-Key', payload.key);
        const res = await fetch(request);
        const blob = await res.blob();
        const canvas = await this.descrambleImage(blob, payload);
        const blobFinally = await this._canvasToBlob(canvas);
        return this._blobToBuffer(blobFinally);
    }

    async descrambleImage(blob, payload) {
        const image = await createImageBitmap(blob);
        const canvas = document.createElement('canvas');
        canvas.width = payload.width;
        canvas.height = payload.height;
        let ctx = canvas.getContext( '2d' );

        ctx.drawImage(image, 0, 0);
        const i = ctx.getImageData(0, 0, payload.width, payload.height);
        const l = await descrambleData(i.data, 4, payload.width, payload.height, payload.gridsize, payload.gridsize, '4wXCKprMMoxnyJ3PocJFs4CYbfnbazNe', payload.key, true );
        const o = new ImageData(l, payload.width, payload.height);
        ctx.putImageData(o, 0, 0);
        return canvas;
    }

    async _canvasToBlob(canvas) {
        return new Promise(resolve => {
            canvas.toBlob(data => {
                resolve(data);
            }, Engine.Settings.recompressionFormat.value, parseFloat(Engine.Settings.recompressionQuality.value) / 100);
        });
    }
}

class PixivShuffler {
    next() {
        let e = 9 * this.tj(5 * this.s[1] >>> 0, 7) >>> 0,
            t = this.s[1] << 9 >>> 0;
        return this.s[2] = (this.s[2] ^ this.s[0]) >>> 0,
        this.s[3] = (this.s[3] ^ this.s[1]) >>> 0,
        this.s[1] = (this.s[1] ^ this.s[2]) >>> 0,
        this.s[0] = (this.s[0] ^ this.s[3]) >>> 0,
        this.s[2] = (this.s[2] ^ t) >>> 0,
        this.s[3] = this.tj(this.s[3], 11),
        e;
    }
    constructor(e) {
        if (4 !== e.length) throw Error('seed.length !== 4 (seed.length: '.concat(e.length, ')'));
        this.s = new Uint32Array(e),
        0 === this.s[0] &&
          0 === this.s[1] &&
          0 === this.s[2] &&
          0 === this.s[3] &&
          (this.s[0] = 1);
    }
    tj(e, t) {
        return (e << (t %= 32) >>> 0 | e >>> 32 - t) >>> 0;
    }

}

function convertWordArrayToUint8Array (wordArray) {
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

async function descrambleData(e, t, i, r, n, s, a, l, o) {

    let d = Math.ceil(r / s),
        c = Math.floor(i / n),
        u = Array(d).fill(null).map(() => Array.from(Array(c).keys()));
    {
        let e = a +l;//new TextEncoder().encode(a + l); //key + magicvalue to bytes, for use with subtlecrypto SHA256
        let t = convertWordArrayToUint8Array(CryptoJS.SHA256(e)); //subtle.digest('SHA-256", e) => return arraybuffer
        let arrayBuffer = t.buffer.slice(t.byteOffset, t.byteLength + t.byteOffset); //we need to properly pass the ArrayBuffer to make the Uint32Array since we used CryptoJS
        let i = new Uint32Array(arrayBuffer, 0, 4);
        let r = new PixivShuffler(i);

        for (let e = 0; e < 100; e++) r.next();
        for (let e = 0; e < d; e++) {
            let t = u[e];
            for (let e = c - 1; e >= 1; e--) {
                let i = r.next() % (e + 1),
                    n = t[e];
                t[e] = t[i],
                t[i] = n;
            }
        }
    }
    if (o) for (let e = 0; e < d; e++) {
        let t = u[e],
            i = t.map((e, i) => t.indexOf(i));
        if (i.some(e => e < 0)) throw Error('Failed to reverse shuffle table');
        u[e] = i;
    }
    let h = new Uint8ClampedArray(e.length);
    for (let a = 0; a < r; a++) {
        let r = Math.floor(a / s),
            l = u[r];
        for (let r = 0; r < c; r++) {
            let s = l[r],
                o = r * n,
                d = (a * i + o) * t,
                c = s * n,
                u = (a * i + c) * t,
                p = n * t;
            for (let t = 0; t < p; t++) h[d + t] = e[u + t];
        }
        {
            let r = c * n,
                s = (a * i + r) * t,
                l = (a * i + i) * t;
            for (let t = s; t < l; t++) h[t] = e[t];
        }
    }
    return h;
}
