import WordPressMangastream from './templates/WordPressMangastream.mjs';

export default class SirenKomik extends WordPressMangastream {

    constructor() {
        super();
        super.id = 'sirenkomik';
        super.label = 'SirenKomik';
        this.tags = ['manga', 'indonesian'];
        this.url = 'https://sirenkomik.my.id';
        this.path = '/manga/list-mode/';
        this.queryChapters = 'div#chaptermanga ul li div.kotak-chapter div.episode a';
        this.queryChaptersTitle = 'span.nomer-chapter';
    }

    async _initializeConnector() {
        // for some reasons, fetchui never ends and we reach timeout. I have to put an empty _initializeConnector
    }

    async _getPages(chapter) {
        const url = new URL(chapter.id, this.url);
        const request = new Request(url, this.requestOptions);
        const [ dom ] = await this.fetchDOM(request, 'body');
        const matches = dom.innerHTML.match(/"images"\s*:\s*(\[.*\])\s*}/)[1];
        return JSON.parse(matches);
    }
}
