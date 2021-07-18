import WordPressMangastream from './templates/WordPressMangastream.mjs';
export default class MangaDisk extends WordPressMangastream {

    constructor() {
        super();
        super.id = 'mangadisk';
        super.label = 'Manga Disk';
        this.tags = [ 'manga', 'indonesian' ];
        this.url = 'https://mangadisk.web.id';
        this.path = '/manga/list-mode/';
        this.queryPages = 'div#readerarea canvas';
        this.requestOptions.headers.set('x-referer', this.url);
    }

    async _getPages(chapter) {
        const uri = new URL(chapter.id, this.url);
        let request = new Request(uri, this.requestOptions);
        let data = await this.fetchDOM(request, this.queryPages);

        return data.map(hash => {
            return this.createConnectorURI('https://img.nesia.my.id/image?id='+hash.getAttribute('file-id'));
        });
    }
}