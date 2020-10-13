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

    // NOTE: This web use costum lazyload method
    async _getPages(chapter) {
        let uri = new URL(chapter.id, this.url);
        let request = new Request(uri, this.requestOptions);
        // NOTE: https://regex101.com/r/Iae1SC/1
        let data = await this.fetchRegex(request, /(?<=ts_reader\.run\()(.*?)(?=\);<\/script>)/gi);
        let result = JSON.parse(data)['sources'][0]['images'];
        return result;
    }
}