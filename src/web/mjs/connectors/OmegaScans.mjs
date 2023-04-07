import Connector from '../engine/Connector.mjs';
import Manga from '../engine/Manga.mjs';

export default class OmegaScans extends Connector {

    constructor() {
        super();
        super.id = 'omegascans';
        super.label = 'OmegaScans';
        this.tags = [ 'webtoon', 'scanlation', 'english', 'hentai'];
        this.url = 'https://omegascans.org';
        this.api = 'https://api.omegascans.org';
        this.nextInstance = 'Uzf9L765by7rm6wVbv5Sb';
    }

    async _initializeConnector() {
        const uri = new URL(this.url);
        const request = new Request(uri.href, this.requestOptions);
        this.nextInstance = await Engine.Request.fetchUI(request, `__NEXT_DATA__.buildId`);
    }

    async _getMangaFromURI(uri) {
        const request = new Request(uri, this.requestOptions);
        const data = await this.fetchDOM(request, 'div.series-title h1');
        const id = uri.pathname.match(/\/series\/(\S+)/)[1];
        const title = data[0].textContent.trim();
        return new Manga(this, id, title);
    }

    //similar to ReaperScansBR

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
                id: element.series_slug,
                title : element.title.trim()
            };
        });
    }
    async _getChapters(manga) {
        const uri = new URL(`/_next/data/${this.nextInstance}/pt/series/${manga.id}.json`, this.url);
        const data = await this.fetchJSON(new Request(uri, this.requestOptions));
        return data.pageProps.series.chapters.map(element => {
            return{
                id: element.id,
                title : element.chapter_name.trim()
            };
        });
    }

    async _getPages(chapter) {
        const uri = new URL(`/series/chapter/${chapter.id}`, this.api);
        const data = await this.fetchJSON(new Request(uri, this.requestOptions));
        return data.content.images.map(element => new URL(element, this.api).href);

    }
}
