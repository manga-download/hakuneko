import WordPressMangastream from './templates/WordPressMangastream.mjs';

export default class KomikTap extends WordPressMangastream {

    constructor() {
        super();
        super.id = 'komiktap';
        super.label = 'KomikTap';
        this.tags = [ 'manga', 'webtoon', 'hentai', 'indonesian' ];
        this.url = 'https://komiktap.in';
        this.path = '/manga/list-mode/';

        this.queryChapters = 'div#chapterlist ul li div.eph-num a';
        this.queryChaptersTitle = 'span.chapternum';
        this.queryPages = 'div#content div.wrapper script';

    }

    // NOTE: This web use costum lazyload methid
    async _getPages(chapter) {
        let uri = new URL(chapter.id, this.url);
        let request = new Request(uri, this.requestOptions);
        let nodelist = await this.fetchDOM(request, this.queryPages);
        // NOTE: faster then find method
        let data = JSON.parse(nodelist[nodelist.length-2].innerText.slice(14,-2))['sources'][0]['images'];
        return data;
    }
}