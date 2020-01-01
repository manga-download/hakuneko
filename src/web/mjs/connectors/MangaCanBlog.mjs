import Connector from '../engine/Connector.mjs';

export default class MangaCanBlog extends Connector {

    constructor() {
        super();
        super.id = 'mangacanblog';
        super.label = 'MangaCan Blog';
        this.tags = [ 'manga', 'indonesian' ];
        this.url = 'https://mangacanblog.com';
    }

    /**
     * TODO: for some reason fetchUI did not return successfully
     */
    async _initializeConnector() {
        return Promise.resolve();
    }

    async _getMangas() {
        let request = new Request(this.url + '/daftar-komik-manga-bahasa-indonesia.html', this.requestOptions);
        let data = await this.fetchDOM(request, 'div.blix ul li a.series');
        return data.map(element => {
            return {
                id: this.getRootRelativeOrAbsoluteLink(element, request.url),
                title: element.text.trim()
            };
        });
    }

    async _getChapters(manga) {
        let request = new Request(this.url + manga.id, this.requestOptions);
        let data = await this.fetchDOM( request, 'div#latestchapters table tr td a.chaptersrec' );
        return data.map(element => {
            return {
                id: this.getRootRelativeOrAbsoluteLink(element, request.url),
                title: element.text.replace(manga.title, '').trim(),
                language: ''
            };
        });
    }

    async _getPages(chapter) {
        let request = new Request( this.url + chapter.id, this.requestOptions );
        let data = await this.fetchDOM(request, 'div.navigation div.pager div.pagers a');
        data = await this.fetchDOM(this.getAbsolutePath(data[0], request.url), 'div#manga source.picture');
        return data.map(element => this.getAbsolutePath(element, request.url));
    }
}