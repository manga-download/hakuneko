import Connector from '../engine/Connector.mjs';
import Manga from '../engine/Manga.mjs';

export default class Yurineko extends Connector {
    constructor() {
        super();
        super.id = 'yurineko';
        super.label = 'Yurineko';
        this.tags = ['manga', 'hentai', 'vietnamese'];
        this.url = 'https://yurineko.net';
        this.api = 'https://api.yurineko.net';
        this.token ='Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MzUwNzk4LCJyb2xlIjoxLCJpYXQiOjE2NzQyOTc1MDYsImV4cCI6MTY3OTQ4MTUwNn0.RWjtSZ-_gJy3AzxmIupbks6BZ0-uIyKvlLI_LbZiRac';
        this.requestOptions.headers.set('Authorization', this.token);
    }

    async _getMangaFromURI(uri) {
        const mangaid = uri.href.match(/manga\/([\d]+)/)[1];
        const request = new Request(new URL('/manga/'+mangaid, this.api), this.requestOptions);
        const data = await this.fetchJSON(request);
        return new Manga(this, uri.pathname, data.originalName.trim());
    }
    async _getMangasFromPage(page) {
        const uri = new URL('/r18Lastest?page=' + page, this.api);
        const request = new Request(uri, this.requestOptions);
        const data = await this.fetchJSON(request);
        return data.result.map(element => {
            return {
                id: '/manga/'+element.id,
                title : element.originalName.trim()
            };
        });
    }

    async _getMangas() {
        let mangaList = [];
        for (let page = 1, run = true; run; page++) {
            let mangas = await this._getMangasFromPage(page);
            mangas.length > 0 ? mangaList.push(...mangas) : run = false;
        }
        const uri = new URL('/directory/general', this.api);
        const request = new Request(uri, this.requestOptions);
        const data = await this.fetchJSON(request);
        let mangas = data.map (element => {
            return {
                id: '/manga/'+element.id,
                title : element.originalName.trim()
            };
        });
        mangaList.push(...mangas);
        console.log(mangaList);
        return mangaList;
    }

    async _getChapters(manga) {
        const uri = new URL(manga.id, this.api);
        const request = new Request(uri, this.requestOptions);
        const data = await this.fetchJSON(request);
        return data.chapters.map (element => {
            return {
                id: '/read/'+element.mangaID+'/'+element.id,
                title : element.name.trim()
            };
        });
    }

    async _getPages(chapter) {
        const uri = new URL(chapter.id, this.url);
        const request = new Request(uri, this.requestOptions);
        const data = await this.fetchDOM(request, '#__NEXT_DATA__');
        const jsonData = JSON.parse(data[0].text);
        return jsonData.props.pageProps.chapterData.url.map( element => this.createConnectorURI({url : element}));
    }

    async _handleConnectorURI(payload) {
        let request = new Request(payload.url, this.requestOptions);
        request.headers.set('x-referer', this.url);
        const response = await fetch(request);
        let data = await response.blob();
        data = await this._blobToBuffer(data);
        this._applyRealMime(data);
        return data;
    }
}