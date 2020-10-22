import GnuBoard5BootstrapBasic2 from './templates/GnuBoard5BootstrapBasic2.mjs';

export default class Manatoki extends GnuBoard5BootstrapBasic2 {

    constructor() {
        super();
        super.id = 'manatoki82';
        super.label = 'Manatoki';
        this.tags = [ 'webtoon', 'korean' ];
        this.url = 'https://manatoki82.net';

        this.path = '/comic/p%PAGE%';
        this.pathMatch = /comic\/p(\d+)/;
        this.queryMangasPageCount = 'div.list-page ul.pagination li:last-child a';
        this.queryMangas = 'ul#webtoon-list-all li div.img-item div.in-lable a';
        this.queryManga = 'meta[name="subject"]';
        this.queryChapter = 'div.serial-list li.list-item div.wr-subject a';
        this.scriptPages =`
        new Promise(resolve => {
            let queryPages = 'div.view-padding div > img';
            if ([...document.querySelectorAll(queryPages)].length == 0){
                queryPages = 'div.view-padding div > p:not([class]) img';
            };
            resolve([...document.querySelectorAll(queryPages)].map(image => JSON.stringify(image.dataset).match(/"\\S{11}":"(.*)"/)[1]));
        });
        `;

    }

    async _getChapters(manga) {
        let request = new Request(new URL(manga.id, this.url), this.requestOptions);
        let data = await this.fetchDOM(request, this.queryChapter);
        return data.map(element => {
            return {
                id: this.getRootRelativeOrAbsoluteLink(element, this.url),
                title: element.textContent.replace(manga.title, '').trim()
            };
        });
    }

    async _getMangas() {
        let mangaList = [];
        let request = new Request(new URL(this.path.replace('%PAGE%', 1), this.url), this.requestOptions);
        let data = await this.fetchDOM(request, this.queryMangasPageCount);
        let pageCount = parseInt(data[0].href.match(this.pathMatch)[1]);
        for(let page = 1; page <= pageCount; page++) {
            let mangas = await this._getMangasFromPage(this.path.replace('%PAGE%', page));
            mangaList.push(...mangas);
        }
        return mangaList;
    }
}