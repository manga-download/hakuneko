import Connector from '../../engine/Connector.mjs';
import Manga from '../../engine/Manga.mjs';

// Theme: https://themesia.com/mangastream-wordpress-theme/
export default class WordPressMangastream extends Connector {

    constructor() {
        super();
        super.id = undefined;
        super.label = undefined;
        this.tags = [];
        this.url = undefined;
        this.path = '/list/';

        this.queryMangas = 'div#content div.soralist ul li a.series';
        this.queryChapters = 'div#chapterlist ul li div.eph-num a';
        this.queryChaptersTitle = 'span.chapternum';
        this.queryPages = 'div#readerarea img[src]:not([src=""])';
        this.querMangaTitleFromURI = 'div#content div.postbody article h1';
    }

    async _getMangas() {
        let request = new Request(new URL(this.path, this.url), this.requestOptions);
        let data = await this.fetchDOM(request, this.queryMangas);
        return data.map(element => {
            return {
                id: this.getRootRelativeOrAbsoluteLink(element, request.url),
                title: element.title ? element.title.trim() : element.text.trim()
            };
        });
    }

    async _getChapters(manga) {
        let request = new Request(new URL(manga.id, this.url), this.requestOptions);
        let data = await this.fetchDOM(request, this.queryChapters);
        return data.map(element => {
            this.adLinkDecrypt(element);
            const title = this.queryChaptersTitle ? element.querySelector(this.queryChaptersTitle).textContent : element.text;
            return {
                id: this.getRootRelativeOrAbsoluteLink(element, request.url),
                title: title.replace(manga.title, '').trim()
            };
        });
    }

    async _getPages(chapter) {
        const script = `
            new Promise((resolve, reject) => {
                if(window.ts_reader) {
                    resolve(ts_reader.params.sources.pop().images);
                } else {
                    setTimeout(() => {
                        try {
                            const images = [...document.querySelectorAll('${this.queryPages}')];
                            resolve(images.map(image => image.dataset['lazySrc'] || image.dataset['src'] || image.src));
                        } catch(error) {
                            reject(error);
                        }
                    }, 500);
                }
            });
        `;
        const uri = new URL(chapter.id, this.url);
        let request = new Request(uri, this.requestOptions);
        let data = await Engine.Request.fetchUI(request, script);
        return data.map(link => this.getAbsolutePath(link, request.url)).filter(link => !link.includes('histats.com'));
    }

    async _getMangaFromURI(uri) {
        const request = new Request(new URL(uri), this.requestOptions);
        const data = await this.fetchDOM(request, this.querMangaTitleFromURI);
        const title = data[0].textContent.trim();

        return new Manga(this, uri, title);
    }
}