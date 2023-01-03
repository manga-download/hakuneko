import WordPressMadara from './templates/WordPressMadara.mjs';

export default class ManhwasNet extends WordPressMadara {

    constructor() {
        super();
        super.id = 'manhwasnet';
        super.label = 'Manhwas';
        this.tags = [ 'webtoon', 'hentai', 'spanish' ];
        this.url = 'https://manhwas.net';
        this.path = '/biblioteca';

        this.queryTitleForURI = 'article.anime-single h1.title';
        this.queryMangas = 'article.anime a';
        this.queryChapters = 'li a.fa-book';
        this.queryPages = 'div#chapter_imgs img[src]:not([src=""])';
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
                title: element.querySelector('h3.title').textContent.trim()
            };
        });
    }

    async _getChapters(manga) {
        let uri = new URL(manga.id, this.url);
        let request = new Request(uri, this.requestOptions);
        let data = await this.fetchDOM(request, this.queryChapters);

        return data.map(element => {
            return {
                id: this.getRootRelativeOrAbsoluteLink(element, request.url),
                title: element.querySelector('p span').textContent.trim(),
            };
        });

    }

    async _getPages(chapter) {
        let script = `
            new Promise((resolve, reject) => {
                setTimeout(() => {
                    try {
                        const images = [ ...document.querySelectorAll('${this.queryPages}') ].map(image => image.src);
                        resolve(images);
                    } catch(error) {
                        reject(error);
                    }
                }, 2500);
            });
        `;
        const uri = new URL(chapter.id, this.url);
        const request = new Request(uri, this.requestOptions);
        const images = await Engine.Request.fetchUI(request, script);
        return images.map(image => {
            return this.createConnectorURI({
                url: image,
                referer: this.url
            });
        });
    }

}
