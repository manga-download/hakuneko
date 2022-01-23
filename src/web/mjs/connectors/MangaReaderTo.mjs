import Connector from '../engine/Connector.mjs';
import Manga from '../engine/Manga.mjs';

export default class MangaReaderTo extends Connector {

    constructor() {
        super();
        super.id = 'mangareaderto';
        super.label = '!MangaReader.to';
        this.tags = ['manga', 'english'];
        this.url = 'https://mangareader.to';
        this.path = '/az-list?page=%PAGE%';

        this.querMangaTitleFromURI = 'div#ani_detail div.anisc-detail h2.manga-name';
        this.queryMangas = '#main-content div.manga-detail h3 a';
        this.queryChapters = 'div.chapters-list-ul ul li a';
        this.queryPages = 'div#wrapper';
        this.queryPagesScript = `
            new Promise((resolve, reject) => {
                setTimeout(() => {
                    try {
                        settings = {
                            hozPageSize: 1,
                            quality: "high",
                            readingDirection: "rtl",
                            readingMode: "vertical,
                        }
                        let images = [];
                        const data = document.querySelectorAll('canvas');
                        for(const d of data) {
                            const image = d.toDataURL();
                            images.push(image);
                        }
                        resolve(images);
                    } catch(error) {
                        reject(error);
                    }
                }, 1000);
            });
        `;
    }

    async _getMangaFromURI(uri) {
        const request = new Request(new URL(uri), this.requestOptions);
        const data = await this.fetchDOM(request, this.queryMangaTitleFromURI);

        const id = uri.pathname;
        const title = data[0].textContent.trim();

        return new Manga(this, id, title);
    }

    async _getMangas() {
        const mangaList = [];
        for(let page = 1, run = true; run; page++) {
            const mangas = await this._getMangasFromPage(page);
            mangas.length ? mangaList.push(...mangas) : run = false;
        }
        return mangaList;
    }

    async _getMangasFromPage(page) {
        const uri = new URL(this.path.replace('%PAGE%', page), this.url);
        const request = new Request(uri, this.requestOptions);
        const data = await this.fetchDOM(request, this.queryMangas);
        return data.map(element => {
            return {
                id: this.getRootRelativeOrAbsoluteLink(element, this.url),
                title: element.title.trim()
            };
        });
    }

    async _getChapters(manga) {
        let uri = new URL(manga.id, this.url);
        let request = new Request(uri, this.requestOptions);
        let data = await this.fetchDOM(request, this.queryChapters);
        return data.map(element => {
            const link = this.getRootRelativeOrAbsoluteLink(element, this.url);
            const title = element.title.replace(/:(.*)/gi, '');
            const lang = link.match(/(\/en\/)|(\/ja\/)/gi);
            const language = lang ? lang[0].replace(/\//gm, '').toUpperCase() : '';
            return {
                id: link,
                title: title.replace(manga.title, '').trim() + ` ${language}` || manga.title,
                language
            };
        });
    }

    // async _getPages(chapter) {
    //     const uri = new URL(chapter.id, this.url);
    //     const request = new Request(uri, this.requestOptions);
    //     const data = await Engine.Request.fetchUI(request, this._queryPagesScript);
    //     return data.map(page => this.createConnectorURI(page));
    // }

    async _getPages(chapter) {
        const uri = new URL(chapter.id, this.url);
        const request = new Request(uri, this.requestOptions);
        const data = await this.fetchDOM(request, this.queryPages);
        const readingId = data[0].getAttribute('data-reading-id');
        return this._getImages(readingId);
    }

    async _getImages(readingId) {
        // https://mangareader.to/ajax/image/list/chap/545260?mode=vertical&quality=high&hozPageSize=1
        const uri = new URL(`ajax/image/list/chap/${readingId}`, this.url);
        uri.searchParams.set('quality', 'high');
        const request = new Request(uri, this.requestOptions);
        const images = await this.fetchJSON(request, 3);
        // Example: https://c-1.mreadercdn.ru/_v2/1/0dcb8f9eaacfd940603bd75c7c152919c72e45517dcfb1087df215e3be94206cfdf45f64815888ea0749af4c0ae5636fabea0abab8c2e938ab3ad7367e9bfa52/9d/32/9d32bd84883afc41e54348e396c2f99a/9d32bd84883afc41e54348e396c2f99a_1200.jpeg?t=4b419e2c814268686ff05d2c25965be9&amp;ttl=1642926021
        // eslint-disable-next-line no-useless-escape
        const re = new RegExp(/https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#;?&//=]*)/, 'gm');
        return images.html.match(re).map(image => image.replace('&amp;', '&'));
    }
}