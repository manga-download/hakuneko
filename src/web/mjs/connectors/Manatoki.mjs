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
        this.queryChapter = 'div.serial-list li.list-item div.wr-subject a';
        this.scriptPages = `
        new Promise(resolve => {
            resolve([...document.querySelectorAll('div.view-padding div > img')].map(img => img.src));
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

    async _getMangasFromPage(page) {
        let request = new Request(new URL(this.path.replace('%PAGE%', page), this.url), this.requestOptions);
        let data = await this.fetchDOM(request, this.queryMangas);
        await new Promise(resolve => setTimeout(resolve, 2000));
        return data.map(element => {
            return {
                id: this.getRootRelativeOrAbsoluteLink(element.pathname, this.url),
                title: element.text.trim()
            };
        });
    }

    async _getMangas() {
        let mangaList = [];
        let request = new Request(new URL(this.path.replace('%PAGE%', 1), this.url), this.requestOptions);
        let data = await this.fetchDOM(request, this.queryMangasPageCount);
        await new Promise(resolve => setTimeout(resolve, 2000));
        let pageCount = parseInt(data[0].href.match(this.pathMatch)[1]);
        for(let page = 1; page <= pageCount; page++) {
            let mangas = await this._getMangasFromPage(page);
            mangaList.push(...mangas);
        }
        return mangaList;
    }
}