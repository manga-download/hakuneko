import WordPressMangastream from './templates/WordPressMangastream.mjs';

export default class DoujinDesu extends WordPressMangastream {

    constructor() {
        super();
        super.id = 'doujindesu';
        super.label = 'DoujinDesu';
        this.tags = ['hentai', 'indonesian'];
        this.url = 'https://doujindesu.tv/';
        this.path = '/manga/page/%PAGE%/';

        this.queryMangas = 'div.entries article.entry a';
        this.queryChapters = 'div#chapter_list div.epsleft span.lchx a';
        this.queryPages = 'div.main div img[src]:not([src=""])';
        this.queryChaptersTitle = undefined;
        this.querMangaTitleFromURI = 'section.metadata h1.title';
    }

    async _getMangas() {
        let mangaList = [];
        for(let page = 1, run = true; run; page++) {
            const path = page > 1 ? this.path : '/manga/';
            let mangas = await this._getMangasFromPage(path, page);
            mangas.length ? mangaList.push(...mangas) : run = false;
        }
        return mangaList;
    }

    async _getMangasFromPage(path, page) {
        const uri = new URL(path.replace('%PAGE%', page), this.url);
        const request = new Request(uri, this.requestOptions);
        const data = await this.fetchDOM(request, this.queryMangas);
        return data.map(element => {
            return {
                id: this.getRootRelativeOrAbsoluteLink(element, this.url),
                title: element.title.trim()
            };
        });
    }

    async _getPages(chapter) {
        const script = `
            new Promise((resolve, reject) => {
                if(window.ts_reader && ts_reader.params.sources) {
                    resolve(ts_reader.params.sources.shift().images);
                } else {
                    setTimeout(() => {
                        try {
                            const images = [...document.querySelectorAll('${this.queryPages}')];
                            resolve(images.map(image => image.dataset['lazySrc'] || image.dataset['src'] || image.getAttribute('original') ||  image.src));
                        } catch(error) {
                            reject(error);
                        }
                    }, 2500);
                }
            });
        `;
        const uri = new URL(chapter.id, this.url);
        let request = new Request(uri, this.requestOptions);
        let data = await Engine.Request.fetchUI(request, script);
        // HACK: bypass 'i0.wp.com' image CDN to ensure original images are loaded directly from host
        return data.map(link => {
            return this.createConnectorURI(this.getAbsolutePath(link, request.url).replace(/\/i\d+\.wp\.com/, ''));
        }).filter(link => !link.includes('histats.com'));
    }

    async _handleConnectorURI(payload) {
        let request = new Request(payload, this.requestOptions);
        request.headers.set('x-referer', this.url);
        let response = await fetch(request);
        let data = await response.blob();
        data = await this._blobToBuffer(data);
        this._applyRealMime(data);
        return data;
    }
}
