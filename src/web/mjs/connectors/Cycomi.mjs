import Connector from '../engine/Connector.mjs';
import Manga from '../engine/Manga.mjs';

export default class CyComi extends Connector {

    constructor() {
        super();
        super.id = 'cycomi';
        super.label = 'CyComi';
        this.tags = ['manga', 'japanese'];
        this.url = 'https://web.cycomi.com';
    }

    async _getMangaFromURI(uri) {
        const request = new Request(uri, this.requestOptions);
        const path = uri.pathname.split("/");
        const id = path[path.length-1];
        const title = (await this.fetchDOM(request, 'h2.css-m40re5'))[0].textContent.trim();
        return new Manga(this, id, title);
    }

    async _getMangas() {
        const uri = new URL('/api/title/serialization/list', this.url);
        const request = new Request(uri, this.requestOptions);
        const response = await this.fetchJSON(request, 'div.card-content > a.card');
        const mangaList = [];
        for(let page = 0; page < 8; page += 1) {
            const mangas = response.data.serialization[""+page].titles.map(title => {
                return {
                    id: title.titleId,
                    title: title.titleName
                };
            });
            mangaList.push(...mangas);
        }
        return mangaList;
    }

    async _getChapters(manga) {
        let cursor = undefined;
        const chapterList = [];
        do {
            const [chapters, nextCursor] = await this._getChaptersFromCursor(manga, cursor);
            chapterList.push(...chapters);
            cursor = nextCursor;
        } while (cursor);
        return chapterList;
    }

    async _getChaptersFromCursor(manga, cursor) {
        const params = new URLSearchParams({
            limit: 20,
            titleId: manga.id,
            sort: 2,
        });
        if (cursor) {
            params.append("cursor", cursor);
        }
        const uri = new URL("/api/chapter/paginatedList?" + params.toString(), this.url);
        const request = new Request(uri, this.requestOptions);
        const response = await this.fetchJSON(request);
        const chapters = response.data.map(element => {
            return {
                id: {"chapterId": element.id, "titleId": manga.id},
                title: element.name + " " + element.subName,
                language: '',
            };
        });
        return [chapters, response.nextCursor];
    }

    s(e, t) {
        let n = (e=>{
                let t = new Uint8Array(256);
                t.forEach((e, n) =>{
                    t[n] = n;
                });
                let n = 0;
                return t.forEach((i, r) =>{
                    n = (n + t[r] + e.charCodeAt(r % e.length)) % 256;
                    let l = t[r];
                    t[r] = t[n],
                    t[n] = l;
                }),
                t;
            }) (t),
            i = 0,
            r = 0,
            l = new Uint8Array(e.length);
        for (let t = 0, a = e.length; t < a; t++) {
            r = (r + n[i = (i + 1) % 256]) % 256;
            let a = n[i % 256];
            n[i % 256] = n[r],
            n[r] = a;
            let o = n[(n[i] + n[r]) % 256];
            l[t] = o ^ e[t];
        }
        return l;
    }

    d(e) {
        return new Promise((t, n) =>{
            let i = new FileReader;
            i.addEventListener('error', n),
            i.addEventListener('load', () =>t(i.result)),
            i.readAsDataURL(new Blob([e]));
        });
    }

    async _getPages(chapter) {
        const uri = new URL("/api/chapter/page/list", this.url);
        const options = {
            ...this.requestOptions,
            method: 'POST',
            body: JSON.stringify(chapter.id),
            headers: {...this.requestOptions.headers, "Content-Type": "application/json"},
        };
        const request = new Request(uri, options);
        const response = await this.fetchJSON(request);
        const pages = response.data.pages;
        const promises = pages.filter(page => page.type == "image")
            .map(page => this._getPage(page.image));
        const results = await Promise.all(promises);
        return results.filter(x => !x.skip).map(x => x.uri);
    }

    async _getPage(uri) {
        const request = new Request(uri, this.requestOptions);
        const response = await fetch(request);
        const data = await response.arrayBuffer();
        const enc = new Uint8Array(data);
        const m = uri.match(/\/([0-9a-zA-Z]{32})\//);
        const key = null === m || void 0 === m ? void 0 : m[1];
        if (!key) return {"skip": true, "uri": uri};
        const dec = this.s(enc, key);
        let dataURL = await this.d(dec);
        dataURL = ['data:image/jpeg;base64', dataURL.split(',') [1]].join(',');
        return {"skip": false, "uri": dataURL};
    }
}
