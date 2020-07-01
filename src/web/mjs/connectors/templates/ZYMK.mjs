import Connector from '../../engine/Connector.mjs';
import Manga from '../../engine/Manga.mjs';

// almost exactly the same as MHXK, but as local installation
export default class ZYMK extends Connector {

    constructor() {
        super();
        super.id = undefined;
        super.label = undefined;
        this.tags = [];
        this.url = undefined;

        this.path = '/sort/';
        this.queryMangaTitle = 'div.title-warper h1.title';
        this.queryMangasPageCount = 'div.pagemain a.mylast';
        this.queryMangas = 'ul.comic-list h3.title a';
        this.queryChapters = 'ul.chapter-list li.item a';

        this.config = {
            format: {
                label: 'Image Format',
                description: 'In general JPEG is considered for premium users, however in some mangas JPEG might still work.',
                input: 'select',
                options: [
                    { value: '', name: 'default' },
                    { value: 'webp', name: 'WEBP' },
                    { value: 'jpg', name: 'JPEG (Premium Only)' }
                ],
                value: ''
            },
            quality: {
                label: 'Image Quality',
                description: 'High quality seems to be restricted, probably for premium only.',
                input: 'select',
                options: [
                    { value: '', name: 'default' },
                    { value: 'low', name: 'Low' },
                    { value: 'middle', name: 'Medium' },
                    { value: 'high', name: 'High (Premium Only)' }
                ],
                value: ''
            }
        };
    }

    async _getMangaFromURI(uri) {
        let request = new Request(uri, this.requestOptions);
        let data = await this.fetchDOM(request, this.queryMangaTitle);
        let id = uri.pathname + uri.search;
        let title = data[0].textContent.trim();
        return new Manga(this, id, title);
    }

    async _getMangas() {
        let mangaList = [];
        let uri = new URL(this.path + '1.html', this.url);
        let request = new Request(uri, this.requestOptions);
        let data = await this.fetchDOM(request, this.queryMangasPageCount);
        let pageCount = parseInt(data[0].href.match(/(\d+)\.html$/)[1]);
        for(let page = 1; page <= pageCount; page++) {
            let mangas = await this._getMangasFromPage(page);
            mangaList.push(...mangas);
        }
        return mangaList;
    }

    async _getMangasFromPage(page) {
        let uri = new URL(this.path + page + '.html', this.url);
        let request = new Request(uri, this.requestOptions);
        let data = await this.fetchDOM(request, this.queryMangas, 3);
        return data.map(element => {
            return {
                id: this.getRootRelativeOrAbsoluteLink(element, request.url),
                title: element.text.trim()
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
                title: element.text.trim(),
                language: ''
            };
        });
    }

    async _getPages(chapter) {
        let script = `
            new Promise(resolve => {
                resolve(new Array(__cr.totalPage).fill().map((_, index) => new URL(__cr.getPicUrl(index + 1), window.location.origin).href));
            });
        `;
        let uri = new URL(chapter.id, this.url);
        let request = new Request(uri, this.requestOptions);
        let data = await Engine.Request.fetchUI(request, script, 60000, false);
        return data.map(image => {
            let parts = image.split('.');
            let format = parts.pop();
            let quality = parts.pop();
            parts.push(this.config.quality.value || quality);
            parts.push(this.config.format.value || format);
            return parts.join('.');
        });
    }
}