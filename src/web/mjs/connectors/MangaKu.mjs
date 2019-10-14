import Connector from '../engine/Connector.mjs';

export default class MangaKu extends Connector {

    constructor() {
        super();
        super.id = 'mangaku';
        super.label = 'MangaKu';
        this.tags = [ 'manga', 'indonesian' ];
        this.url = 'https://mangaku.in';
    }

    async _getMangaList(callback) {
        try {
            let request = new Request(this.url + '/daftar-komik-bahasa-indonesia', this.requestOptions);
            let data = await this.fetchDOM(request, 'div.series_col ul li a.screenshot');
            let mangaList = data.map(element => {
                return {
                    id: this.getRootRelativeOrAbsoluteLink(element, request.url),
                    title: element.text.trim()
                };
            });
            callback(null, mangaList);
        } catch(error) {
            console.error(error, this);
            callback(error, undefined);
        }
    }

    async _getChapterList(manga, callback) {
        try {
            let request = new Request(this.url + manga.id, this.requestOptions);
            let data = await this.fetchDOM(request, 'small div[style*="border-radius"] a');
            let chapterList = data.map(element => {
                return {
                    id: this.getRootRelativeOrAbsoluteLink(element, request.url),
                    title: element.text.replace(manga.title, '').replace('–', '').trim(),
                    language: ''
                };
            });
            callback(null, chapterList);
        } catch(error) {
            console.error(error, manga);
            callback(error, undefined);
        }
    }

    async _getPageList(manga, chapter, callback) {
        try {
            let request = new Request(new URL(chapter.id, this.url), this.requestOptions);
            let data = await this.fetchDOM(request, 'div.entry div.separator source, div.entry-content source[alt*="Mirror"]');
            let pageList = data.map(element => this.getAbsolutePath(element, request.url));
            callback(null, pageList);
        } catch(error) {
            console.error(error, manga);
            callback(error, undefined);
        }
    }
}