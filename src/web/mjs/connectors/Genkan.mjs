import Connector from '../engine/Connector.mjs';
import Manga from '../engine/Manga.mjs';

export default class Genkan extends Connector {

    constructor() {
        super();
        super.id = 'genkan';
        super.label = 'Genkan';
        this.tags = [ 'webtoon', 'english' ];
        this.url = 'https://genkan.io';
        this.links = {
            login: this.url + '/login'
        };
    }

    async _getMangaFromURI(uri) {
        const request = new Request(uri, this.requestOptions);
        const data = await this.fetchDOM(request, 'meta[property="og:title"]');
        const title = data[0].content.replace(/\s*-\s*Genkan\s*$/i, '').trim();
        return new Manga(this, uri.pathname, title);
    }

    async _getMangas() {
        let mangaList = [];
        for (let page = 1, run = true; run; page++) {
            const mangas = await this._getMangasFromPage(page);
            mangas.length > 0 ? mangaList.push(...mangas) : run = false;
        }
        return mangaList;
    }

    async _getMangasFromPage(page) {
        const uri = new URL('/manga?page=' + page, this.url);
        const request = new Request(uri, this.requestOptions);
        const data = await this.fetchDOM(request, 'a.relative > div.absolute > p.font-bold');
        return data.map(element => {
            return {
                id: this.getRootRelativeOrAbsoluteLink(element.closest('a'), this.url),
                title: element.textContent.trim()
            };
        });
    }

    async _getChapters(manga) {
        const uri = new URL(manga.id, this.url);
        const request = new Request(uri, this.requestOptions);
        const data = await this.fetchDOM(request, 'table.min-w-full tbody tr');
        return data.map(element => {
            const id = this.getRootRelativeOrAbsoluteLink(element.querySelector('td:nth-of-type(6) a'), this.url);
            const number = element.querySelector('td:nth-of-type(1)').textContent.trim().padStart(4, '0');
            const title = element.querySelector('td:nth-of-type(2)').textContent.replace(/^\s*-\s*$/, '').trim();
            const language = element.querySelector('td:nth-of-type(3)').textContent.trim();
            const scanlator = element.querySelector('td:nth-of-type(4)').textContent.trim();
            return {
                id: id,
                title: `${number}${title ? ' - ' + title : ''} (${language}) [${scanlator}]`,
                language: language
            };
        });
    }

    async _getPages(chapter) {
        const uri = new URL(chapter.id, this.url);
        const request = new Request(uri, this.requestOptions);
        const data = await this.fetchDOM(request, 'div.mx-auto > source.block');
        return data.map(image => this.getAbsolutePath(image, request.url));
    }
}