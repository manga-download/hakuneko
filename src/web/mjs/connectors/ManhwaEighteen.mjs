import FlatManga from './templates/FlatManga.mjs';

export default class ManhwaEighteen extends FlatManga {

    constructor() {
        super();
        super.id = 'manhwa18-int';
        super.label = 'Manhwa 18 (.net)';
        this.tags = [ 'hentai', 'multi-lingual' ];
        this.url = 'https://manhwa18.net';
        this.requestOptions.headers.set('x-referer', this.url);
        this.requestOptions.headers.set('x-cookies', "cf_use_ob=0");
        this.requestOptions.headers.set('x-cookies', "cf_ob_info=520:727ecb266cde4745:SIN");
        // this.requestOptions.headers.set('x-cookies', "PHPSESSID=bnltt6cutg4g0d9moic50li5aj");
    }

    async _getMangas() {
        let mangaList = [];
        for (let page = 1, run = true; run; page++) {
            const mangas = await this._getMangasFromPage(page);
            mangas.length > 0 ? mangaList.push(...mangas) : run = false;
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