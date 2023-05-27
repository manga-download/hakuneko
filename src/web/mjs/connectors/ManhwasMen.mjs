import WordPressMadara from './templates/WordPressMadara.mjs';

export default class ManhwasMen extends WordPressMadara {

    constructor() {
        super();
        super.id = 'manhwasmen';
        super.label = 'Manhwas Men';
        this.tags = [ 'webtoon', 'hentai', 'korean', 'english' ];
        this.url = 'https://manhwas.men';
        this.path = '/manga-list';
        this.queryMangas = 'div.series-box a';
        this.queryChapters = 'li.wp-manga-chapter a';
        this.queryChaptersTitleBloat = 'span';
        this.queryPages = 'div#chapter_imgs source';

    }

    async _getMangas() {
        let mangaList = [];
        for(let page = 1, run = true; run; page++) {
            let mangas = await this._getMangasFromPage(page);
            mangas.length > 0 ? mangaList.push(...mangas) : run = false;
        }
        return mangaList;
    }

    async _getMangasFromPage(page) {
        let uri = new URL(`${this.path}?page=${page}`, this.url);
        let request = new Request(uri, this.requestOptions);
        let data = await this.fetchDOM(request, this.queryMangas);
        return data.map(element => {
            return {
                id: this.getRootRelativeOrAbsoluteLink(element, request.url),
                title: element.querySelector('h5.series-title').textContent.trim()
            };
        });
    }

}
