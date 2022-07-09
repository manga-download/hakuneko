import FlatManga from './templates/FlatManga.mjs';

export default class ManhwaEighteen extends FlatManga {

    constructor() {
        super();
        super.id = 'manhwa18-int';
        super.label = 'Manhwa 18 (.net)';
        this.tags = [ 'hentai', 'multi-lingual' ];
        this.url = 'https://manhwa18.net';
    }

    async _getMangas() {
        let mangaList = [];
        for (let page = 1, run = true; run; page++) {
            const mangas = await this._getMangasFromPage(page);
            if (JSON.stringify(mangaList[mangaList.length - 1]) == undefined && mangas[mangas.length - 1] != undefined ) {
                mangaList.push(...mangas);
            } else if (JSON.stringify(mangaList[mangaList.length - 1].id) != JSON.stringify(mangas[mangas.length - 1].id)) {
                if (mangas.length > 0) {
                    mangaList.push(...mangas);
                }
            } else {
                run = false;
            }
        }
        return mangaList;
    }

    async _getMangasFromPage(page) {
        let request = new Request(this.url + '/manga-list.html?listType=pagination&sort=name&sort_type=ASC&page=' + page, this.requestOptions);
        let data = await this.fetchDOM(request, 'div.series-title a');
        return data.map(element => {
            return {
                id: this.getRootRelativeOrAbsoluteLink(element, request.url),
                title: element.text.trim()
            };
        });
    }

    async _getChapters(manga) {

        let request = new Request(this.url + manga.id, this.requestOptions);
        let data = await this.fetchDOM(request, 'ul.list-chapters a');
        return data.map(element => {
            return {
                id: this.getRootRelativeOrAbsoluteLink(element, request.url),
                title: element.text.trim(),
                language: ''
            };
        });
    }

    async _getPages(chapter) {
        let request = new Request(this.url + chapter.id, this.requestOptions);
        let data = await this.fetchDOM(request, 'div.chapter-content source._lazy');
        return data.map(element => this.getAbsolutePath(element.dataset.src || element, request.url));
    }
}