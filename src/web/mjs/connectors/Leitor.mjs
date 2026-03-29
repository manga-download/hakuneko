import Connector from '../engine/Connector.mjs';
import Manga from '../engine/Manga.mjs';

// Base for MangaLivre
export default class Leitor extends Connector {

    constructor() {
        super();
        super.id = 'leitor';
        super.label = 'Leitor';
        this.tags = [ 'manga', 'webtoon', 'portuguese' ];
        this.url = 'https://leitor.net';
    }

    async _initializeConnector() {
        const paths = [ '/', '/manga/_/_/capitulo-' ];
        for(let path of paths) {
            const uri = new URL(path, this.url);
            const request = new Request(uri, this.requestOptions);
            await Engine.Request.fetchUI(request, '', 30000, true);
        }
    }

    async _getMangaFromURI(uri) {
        const request = new Request(uri, this.requestOptions);
        const data = await this.fetchDOM(request, 'div#series-data div.series-info span.series-title h1');
        const id = uri.pathname;
        const title = data[0].textContent.trim();
        return new Manga(this, id, title);
    }

    async _getMangas() {
        let mangaList = [];
        for(let page = 1, run = true; run; page++) {
            const mangas = await this._getMangasFromPage(page);
            mangas.length > 0 ? mangaList.push(...mangas) : run = false;
        }
        return mangaList;
    }

    async _getMangasFromPage(page) {
        const uri = new URL(`/series/index/?page=${page}`, this.url);
        const request = new Request(uri, this.requestOptions);
        const data = await this.fetchDOM(request, 'ul.seriesList li > a.link-block');
        return data.map(element => {
            return {
                id: this.getRootRelativeOrAbsoluteLink(element, this.url),
                title: element.title.replace(/(?:^\s*ler\s+|\s+online\s*$)/gi, '').trim()
            };
        });
    }

    async _getChapters(manga) {
        let chapterList = [];
        for(let page = 1, run = true; run; page++) {
            const chapters = await this._getChaptersFromPage(manga, page);
            chapters.length > 0 ? chapterList.push(...chapters) : run = false;
        }
        return chapterList;
    }

    async _getChaptersFromPage(manga, page) {
        const uri = new URL('/series/chapters_list.json', this.url);
        uri.searchParams.set('id_serie', manga.id.match(/\/(\d+)\/?$/)[1]);
        uri.searchParams.set('page', page);
        let request = new Request(uri, this.requestOptions);
        request.headers.set('X-Requested-With', 'XMLHttpRequest');
        let data = await this.fetchJSON(request);
        return !data.chapters ? [] : data.chapters.reduce((accumulator, chapter) => {
            //const id = chapter.id_chapter;
            const title = chapter.chapter_name ? `${chapter.number} - ${chapter.chapter_name}` : chapter.number;
            const releases = Object.values(chapter.releases).map(release => {
                const scanlators = release.scanlators.map(scanlator => scanlator.name).join(', ');
                return {
                    id: release.link,
                    title: `${title} [${scanlators}]`
                };
            });
            return accumulator.concat(releases);
        }, []);
    }

    async _getPages(chapter) {
        const uri = new URL(chapter.id, this.url);
        const request = new Request(uri, this.requestOptions);
        const data = await this.fetchDOM(request, 'script[src*="token="]');
        const source = new URL(data[0].src);
        const release = source.searchParams.get('id_release');
        const token = source.searchParams.get('token');
        return this._getImageLinks(release, token);
    }

    async _getImageLinks(release, token) {
        const uri = new URL(`/leitor/pages/${release}.json`, this.url);
        uri.searchParams.set('key', token);
        const request = new Request(uri, this.requestOptions);
        request.headers.set('X-Requested-With', 'XMLHttpRequest');
        const data = await this.fetchJSON(request);
        return data.images.map(image => image.legacy);
    }
}