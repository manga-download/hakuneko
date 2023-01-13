import Connector from '../engine/Connector.mjs';
import Manga from '../engine/Manga.mjs';
export default class ReaperScansBR extends Connector {

    constructor() {
        super();
        super.id = 'reaperscansbr';
        super.label = 'Reaper Scans (Portuguese)';
        this.tags = [ 'webtoon', 'portuguese' ];
        this.api = 'https://api.reaperscans.net';
        this.url = 'https://reaperscans.net';
        this.queryChapters = 'ul.chapters-list-single > a';
        this.queryPages = 'source.comic-chapter-image';
        this.queryMangaTitle ='div.series-title > h1';
        this.links = {
            login: 'https://reaperscans.net/login'
        };
    }
    async _getMangas() {
        let mangaList = [];
        for (let page = 1, run = true; run; page++) {
            let mangas = await this._getMangasFromPage(page);
            mangas.length > 0 ? mangaList.push(...mangas) : run = false;
        }
        return mangaList;
    }
    async _getMangasFromPage(page) {
        let uri = new URL('/series/querysearch', this.api);
        let body = {
            order : 'asc',
            order_by : 'latest',
            series_type : 'Comic',
            page : page,
            tagIds : [],
        };
        let request = new Request(uri, {
            method: 'POST',
            body: JSON.stringify(body),
            headers: {
                'Accept': 'text/html, application/xhtml+xml',
                'Content-Type': 'application/json',
                'x-referrer': this.url,
            }
        });
        let data = await fetch(request);
        data = await data.json();
        return data.data.map(element => {
            return{
                id: '/series/'+this.getRootRelativeOrAbsoluteLink(element.series_slug, this.url),
                title : element.title.trim()
            };
        });
    }
    async _getChapters(manga) {
        const uri = new URL(manga.id, this.url);
        const request = new Request(uri, this.requestOptions);
        const data = await this.fetchDOM(request, this.queryChapters);
        return data.map(element => {
            return {
                id: this.getRootRelativeOrAbsoluteLink(element, this.url),
                title: element.querySelector('span.chapter-span.name').textContent.trim(),
            };
        });
    }
    async _getPages(chapter) {
        let request = new Request(this.url + chapter.id, this.requestOptions);
        const script = `
        new Promise(resolve => {
            resolve(__NEXT_DATA__);
        });
        `;
        let data = await Engine.Request.fetchUI(request, script);
        const chapterid = data.props.pageProps.data.id;
        const uri = new URL('/series/chapter/'+chapterid, this.api);
        request = new Request(uri, this.requestOptions);
        request.headers.set('x-origin', this.url);
        data = await this.fetchJSON(request);
        return data.content.images.map( element => {
            return new URL(element, this.api).href;
        });
    }
    async _getMangaFromURI(uri) {
        const request = new Request(uri, this.requestOptions);
        const id = uri.pathname;
        const title = (await this.fetchDOM(request, this.queryMangaTitle))[0].text.trim();
        return new Manga(this, id, title);
    }
}
