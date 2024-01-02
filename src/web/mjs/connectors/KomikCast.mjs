import WordPressMangastream from './templates/WordPressMangastream.mjs';

export default class KomikCast extends WordPressMangastream {

    constructor() {
        super();
        super.id = 'komikcast';
        super.label = 'KomikCast';
        this.tags = [ 'manga', 'indonesian' ];
        this.url = 'https://komikcast.ch';
        this.path = '/daftar-komik/?list';

        this.queryMangas = 'div.text-mode_list-items ul li a.series, div.text-mode_list-items ul li a.text-mode_list-item';
        this.queryChapters = 'div.komik_info-chapters ul li.komik_info-chapters-item a.chapter-link-item';
        this.queryChaptersTitle = undefined;
        this.queryPages = 'div.main-reading-area source.lazyload, div.separator source.lazyload';
        this.requestOptions.headers.set('x-referer', this.url);
    }

    async _initializeConnector() {
        // do nothing on purpose
    }

    async _getPages(chapter) {
        const uri = new URL(chapter.id, this.url);
        const request = new Request(uri, this.requestOptions);
        const data = await this.fetchDOM(request, this.queryPages);
        return data.map(image => this.createConnectorURI(this.getAbsolutePath(image.dataset['src'], this.url)));
    }
}
