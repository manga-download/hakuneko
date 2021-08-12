import Connector from '../engine/Connector.mjs';
import Manga from '../engine/Manga.mjs';

export default class kakaopage extends Connector {

    constructor() {
        super();
        super.id = 'kakaopage';
        super.label = 'Page Kakao (카카오페이지) ';
        this.tags = [ 'webtoon', 'manga', 'korean' ];
        this.url = 'https://page.kakao.com';
        this.requestOptions.headers.set('x-origin', this.url);
        this.requestOptions.headers.set('x-referer', this.url);
    }

    async _getMangaFromURI(uri) {
        uri = new URL(uri);
        const request = new Request(uri, this.requestOptions);
        let id = uri.searchParams.get('seriesId') || uri.pathname.split('/').filter(part => part).pop();
        let data = await this.fetchDOM(request, 'meta[property="og:title"]', 3);
        let title = data[0].content.trim();
        return new Manga(this, id, title);
    }

    async _getMangas() {
        let msg = 'This website does not provide a manga list, please copy and paste the URL containing the images directly from your browser into HakuNeko.';
        throw new Error(msg);
    }

    async _getChapters(manga) {
        let chapterList = [];
        for(let page = 0, run = true; run; page++) {
            let chapters = await this._getChaptersFromPage(manga, page);
            chapters.length > 0 ? chapterList.push(...chapters) : run = false;
        }
        return chapterList;
    }

    async _getChaptersFromPage(manga, page) {
        let form = new FormData();
        form.append('seriesid', manga.id);
        form.append('page', page);
        form.append('direction', 'desc');
        form.append('page_size', 20);
        form.append('without_hidden', true);
        let request = new Request('https://api2-page.kakao.com/api/v5/store/singles', {
            ...this.requestOptions,
            method: 'POST',
            body: form
        });
        let data = await this.fetchJSON(request);
        return data.singles.map(ele => {
            return{
                id: ele.id,
                title: ele.title.trim()
            };
        });
    }

    async _getPages(chapter) {
        let form = new FormData();
        form.append('productId', chapter.id);
        this.requestOptions.method = 'POST';
        this.requestOptions.body = form;
        let request = new Request('https://api2-page.kakao.com/api/v1/inven/get_download_data/web', {
            ...this.requestOptions,
            method: 'POST',
            body: form
        });
        this.requestOptions.method = 'GET';
        delete this.requestOptions.body;
        let data = await this.fetchJSON(request);
        if (data.downloadData && data.downloadData.members) {
            return data.downloadData.members.files.map(element => data.downloadData.members.sAtsServerUrl + element.secureUrl);
        }

        throw new Error(`Can't fetch this ressource because it's protected`);
    }
}