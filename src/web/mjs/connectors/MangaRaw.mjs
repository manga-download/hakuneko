import Connector from '../engine/Connector.mjs';
import Manga from '../engine/Manga.mjs';

export default class MangaRaw extends Connector {

    constructor() {
        super();
        super.id = 'mangaraw';
        super.label = 'MangaRaw (Manga Raw Club)';
        this.tags = ['multi-lingual', 'manga', 'webtoon'];
        this.url = 'https://www.manga-raw.club';
    }

    async _getMangas() {
        let mangaList = [];
        let request = new Request(this.url +'/browse/', this.requestOptions);
        let data = await this.fetchDOM(request, '#explore > nav.paging a:nth-last-of-type(2)');
        let pageCount = parseInt(data[0].href.match(/results=(\d+)&/)[1]);
        for(let page = 1; page <= pageCount; page++) {
            await this.wait(250);
            let mangas = await this._getMangasFromPage(page);
            mangaList.push(...mangas);
        }
        return mangaList;
    }

    async _getMangasFromPage(page) {
        let request = new Request(`${this.url}/browse/?results=${page}`, this.requestOptions);
        let data = await this.fetchDOM(request, '.novel-item a', 3);
        return data.map(element => {
            return {
                id: this.getRootRelativeOrAbsoluteLink(element, this.url),
                title: element.title.trim()
            };
        });
    }

    async _getMangaFromURI(uri) {
        let request = new Request(uri, this.requestOptions);
        let data = await this.fetchDOM(request, '#novel');
        let id = uri.pathname + uri.search;
        let title = data[0].dataset.novelstr.trim();
        return new Manga(this, id, title);
    }

    async _getPages(chapter) {
        let request = new Request(new URL(chapter.id, this.url), this.requestOptions);
        let data = await this.fetchDOM(request, 'source.loading');
        return data.map(element => this.getAbsolutePath(element.src, request.url));
    }

    async _getChapters(manga) {
        let script = `
        new Promise(resolve => {
            showDivEn();
            const chaptersEn = [...document.querySelectorAll('ul#raw > li > a')].map(data => {
                return{
                    id: data.pathname,
                    title: data.title.trim().replace('-eng-li',' [en]'),
                    language: 'en'
                }
            })
            showDivRaw();
            const chaptersRaw = [...document.querySelectorAll('ul#raw > li > a')].map(data => {
                return{
                    id: data.pathname,
                    title: data.title.trim(),
                    language: 'raw'
                }
            })
            resolve([ ...chaptersEn, ...chaptersRaw ]);
        });
        `;
        let request = new Request(this.url + manga.id, this.requestOptions);
        return Engine.Request.fetchUI(request, script);
    }
}