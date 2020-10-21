import MH from './templates/MH.mjs';

export default class kuman5 extends MH {
    constructor() {
        super();
        super.id = 'kuman5';
        super.label = '酷漫屋 (Kuman55)';
        this.tags = [ 'manga', 'chinese' ];
        this.url = 'http://www.kuman55.com';

        this.queryChapter = 'div#chapterlistload ul#detail-list-select-1 li a';
        this.path = '/sort/1-%PAGE%.html';
    }

    async _getMangas() {
        let mangaList = [];
        for(let page = 1, run = true; run; page++) {
            let mangas = await this._getMangasFromPage(page);
            mangas.length > 0 ? mangaList.push(...mangas) : run = false;
        }
        mangaList.forEach(manga => manga.id = `/mulu${manga.id}1-1.html`);
        return mangaList;
    }

    async _getPages(chapter) {
        let request = new Request(new URL(chapter.id, this.url), this.requestOptions);
        let data = await this.fetchRegex(request, /km5_img_url\s*=\s*['"]([^'"]+)['"]/g);
        return JSON.parse(atob(data[0])).map(page => page.split('|')[1]);
    }
}