import Connector from '../engine/Connector.mjs';

export default class MangaKatana extends Connector {

    constructor() {
        super();
        super.id = 'mangakatana';
        super.label = 'MangaKatana';
        this.tags = [ 'manga', 'english' ];
        this.url = 'https://mangakatana.com';
    }

    async _getMangaListPage(pageNumber) {
        let request = new Request(this.url + '/manga/page/' + pageNumber, this.requestOptions);
        let data = await this.fetchDOM(request, 'div#book_list div.item div.text h3.title a');
        return data.map(element => {
            return {
                id: this.getRootRelativeOrAbsoluteLink(element, request.url),
                title: element.text.trim()
            };
        });
    }

    async _getMangaList(callback) {
        try {
            let mangaList = [];
            let request = new Request(this.url + '/manga', this.requestOptions);
            let data = await this.fetchDOM(request, 'div#book_list ul.uk-pagination li:nth-last-of-type(2) a');
            let pageCount = parseInt(data[0].href.match(/\/(\d+)$/)[1]);
            for(let page = 1; page <= pageCount; page++) {
                let mangas = await this._getMangaListPage(page);
                mangaList.push(...mangas);
            }
            callback(null, mangaList);
        } catch(error) {
            console.error(error, this);
            callback(error, undefined);
        }
    }

    async _getChapterList(manga, callback) {
        try {
            let request = new Request(this.url + manga.id, this.requestOptions);
            let data = await this.fetchDOM(request, 'div.chapters table tbody tr td div.chapter a');
            let chapterList = data.map(element => {
                return {
                    id: this.getRootRelativeOrAbsoluteLink(element, request.url),
                    title: element.text.trim(),
                    language: ''
                };
            });
            callback(null, chapterList);
        } catch(error) {
            console.error(error, manga);
            callback(error, undefined);
        }
    }

    async _getPageList(manga, chapter, callback) {
        try {
            let script = `
                new Promise(resolve => {
                    //let images = [...document.querySelectorAll('div#imgs div.wrap_img img')].map(img => img.src);
                    //resolve(images);
                    resolve(ytaw);
                });
            `;
            let request = new Request(this.url + chapter.id, this.requestOptions);
            let data = await Engine.Request.fetchUI(request, script);
            callback(null, data);
        } catch(error) {
            console.error(error, manga);
            callback(error, undefined);
        }
    }
}