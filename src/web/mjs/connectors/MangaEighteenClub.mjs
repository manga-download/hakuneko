import MangaReaderCMS from './templates/MangaReaderCMS.mjs';

export default class MangaEighteenClub extends MangaReaderCMS {

    constructor() {
        super();
        super.id = 'manga18-club';
        super.label = 'Manga18.club';
        this.tags = [ 'webtoon', 'hentai', 'english' ];
        this.url = 'https://manga18.club';

        this.queryChapters = 'ul li div.item a.chapter_num';
        this.queryPages = 'div.imageChap source.img-responsive';
        this.queryTitleForURI = '.detail_name h1';
        this.language = 'en';
    }

    async _getMangas() {
        let mangaList = [];
        for (let page = 1, run = true; run; page++) {
            let mangas = await this._getMangasFromPage(page);
            mangas.length > 0 ? mangaList.push(...mangas) : run = false;
        }
        return mangaList;
    }

    async _getMangasFromPage(page) {
        const uri = new URL('/list-manga/' + page, this.url);
        const request = new Request(uri, this.requestOptions);
        let data = await this.fetchDOM(request, 'div.story_item div.mg_info div.mg_name > a');
        return data.map(element => {
            return {
                id: this.getRootRelativeOrAbsoluteLink(element, request.url),
                title: element.text.trim()
            };
        });
    }

    async _getPages(chapter) {
        const uri = new URL(chapter.id, this.url);
        const request = new Request(uri, this.requestOptions);
        const data = await this.fetchDOM(request, 'script[type="text/javascript"]:not([src])');
        return JSON.parse("[" + data[0].textContent.match(/var slides_p_path = \[([^\]]*),\];/)[1] + "]").map(link => atob(link));
    }
}