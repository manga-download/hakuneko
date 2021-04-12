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
        return (await this.fetchDOM(request, 'div.episode-list')).reduce((accumulator, element) => {
            const flavour = element.previousElementSibling.classList.contains('episode-head') ? element.previousElementSibling.textContent.trim() : undefined;
            const chapters = [...element.querySelectorAll('div.episode-item > a')].map(chapter => {
                return {
                    id: this.getRootRelativeOrAbsoluteLink(chapter, this.url),
                    title: chapter.text.trim() + (flavour ? ` [${flavour}]` : '')
                };
            });
            return accumulator.concat(chapters);
        }, []);
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