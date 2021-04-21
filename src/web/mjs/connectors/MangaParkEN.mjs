import Connector from '../engine/Connector.mjs';
import Manga from '../engine/Manga.mjs';

// Very similar to AnyACG (e.g. bato.to)
export default class MangaParkEN extends Connector {

    constructor() {
        super();
        super.id = 'mangapark-en';
        super.label = 'MangaPark';
        this.tags = [ 'manga', 'english' ];
        this.url = 'https://v3.mangapark.net';
        this.requestOptions.headers.set('x-cookie', 'set=h=1;');
    }

    async _getMangaFromURI(uri) {
        const request = new Request(uri, this.requestOptions);
        const data = await this.fetchDOM(request, 'meta[property="og:title"]');
        return new Manga(this, uri.pathname, data[0].content.trim());
    }

    async _getMangas() {
        let mangaList = [];
        const uri = new URL('/ajax.reader.home.release', this.url);
        for (let page = '', run = true; run;) {
            const request = new Request(uri, {
                method: 'POST',
                body: JSON.stringify({ prevPos: page }),
                headers: { 'content-type': 'application/json' }
            });
            const data = await this.fetchJSON(request);
            const mangas = [...this.createDOM(data.html).querySelectorAll('div.item > div > a.fw-bold')].map(element => {
                return {
                    id: this.getRootRelativeOrAbsoluteLink(element, this.url),
                    title: element.text.trim()
                };
            });
            mangaList.push(...mangas);
            run = !data.isLast;
            page = data.lastPos;
        }
        return mangaList;
    }

    async _getChapters(manga) {
        const uri = new URL(manga.id, this.url);
        const request = new Request(uri, this.requestOptions);
        const data = await this.fetchDOM(request, 'div.episode-head');
        return data
            .map(element => {
                let iid = element.getAttribute('@click');
                iid = iid ? iid.match(/\d+/) : undefined;
                iid = iid ? iid[0] : undefined;
                let language = element.querySelector('em[data-lang]');
                language = language ? ' | ' + language.dataset.lang : '';
                let title = element.querySelector('b');
                title = title ? title.textContent.replace(/\s+/g, ' ').trim() : '';
                title += language.toUpperCase();
                return { iid, title };
            })
            .filter(folder => folder.iid)
            .reduce(async (accumulator, folder) => {
                const req = new Request(this.url + '/ajax.reader.subject.episodes.folder', {
                    method: 'POST',
                    body: `{"iid":${folder.iid}}`,
                    headers: {
                        'Content-Type': 'application/json;charset=UTF-8'
                    }
                });
                const foo = await this.fetchJSON(req);
                const dom = this.createDOM(foo.html);
                const chapters = [...dom.querySelectorAll('div.episode-item a.chapt')].map(element => {
                    return {
                        id: this.getRootRelativeOrAbsoluteLink(element, this.url),
                        title: element.text.trim() + (folder.title ? ` [${folder.title}]` : '')
                    };
                });
                return (await accumulator).concat(chapters);
            }, Promise.resolve([]));
    }

    async _getPages(chapter) {
        const script = `
            new Promise((resolve, reject) => {
                setTimeout(() => {
                    try {
                        resolve(app.items.map(item => item.isrc));
                    } catch(error) {
                        reject(error);
                    }
                }, 2500);
            });
        `;
        const uri = new URL(chapter.id, this.url);
        const request = new Request(uri, this.requestOptions);
        return Engine.Request.fetchUI(request, script);
    }
}