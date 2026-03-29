import Connector from '../engine/Connector.mjs';

export default class Migudm extends Connector {

    constructor() {
        super();
        super.id = 'migudm';
        super.label = '咪咕 (Migudm)';
        this.tags = [ 'webtoon', 'chinese' ];
        this.url = 'https://www.migudm.cn';

        this.path = '/comic/list_p%PAGE%/';
        this.queryMangas = 'div.classificationList ul li div.clItemRight h4.title a';
        this.queryChapters = 'div.comic div#negCtSectionListBd div.titleList a.item';
        this.queryPages = 'div.comicMain ul.readUl li img';
    }

    async _getMangas() {
        let mangaList = [];
        for(let page = 1, run = true; run; page++) {
            let mangas = await this._getMangasFromPage(page);
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
                id: this.getRootRelativeOrAbsoluteLink(element, request.url),
                title: element.text.trim()
            };
        });
    }

    async _getChapters(manga) {
        const uri = new URL(manga.id, this.url);
        const request = new Request(uri, this.requestOptions);
        const data = await this.fetchDOM(request, this.queryChapters);
        return data.map(element => {
            return {
                id: this.getRootRelativeOrAbsoluteLink(element, request.url),
                title: element.title.replace(manga.title, '').trim()
            };
        });
    }

    async _getPages(chapter) {
        const script = `
            new Promise((resolve, reject) => {
                setTimeout(() => {
                    try {
                        const images = [...document.querySelectorAll('${this.queryPages}')];
                        resolve(images.map(image => image.dataset['src'] || image.dataset['data-src'] || image.src));
                    } catch(error) {
                        reject(error);
                    }
                }, 1000);
            });
        `;
        const uri = new URL(chapter.id, this.url);
        const request = new Request(uri, this.requestOptions);
        const data = await Engine.Request.fetchUI(request, script);
        return data.map(element => this.getAbsolutePath(element, request.url));
    }

}