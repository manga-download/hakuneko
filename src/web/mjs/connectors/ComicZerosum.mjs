import Connector from '../engine/Connector.mjs';
import Manga from '../engine/Manga.mjs';

export default class ComicZerosum extends Connector {

    constructor() {
        super();
        super.id = 'comiczerosum';
        super.label = 'Comic ゼロサム (Comic ZEROSUM)';
        this.tags = ['manga', 'japanese'];
        this.url = 'https://zerosumonline.com';
        this.api_url = 'https://api.zerosumonline.com/api/v1/';
        this.protoTypes = '/mjs/connectors/ComicZerosum.proto';

    }

    async _getMangaFromURI(uri) {
        //'https://api.zerosumonline.com/api/v1/title?tag=
        const mangaid = uri.href.match(/\/detail\/([\w]+)/)[1];
        const requri = new URL(`title?tag=${mangaid}`, this.api_url);
        const responseType = 'ComicZerosum.TitleView';
        const request = new Request(requri, this.requestOptions);
        const data = await this.fetchPROTO(request, this.protoTypes, responseType);
        return new Manga(this, data.title.tag, data.title.name);
    }

    async _getMangas() {
        const uri = new URL('list?category=series&sort=date', this.api_url);
        const responseType = 'ComicZerosum.Listview';
        const request = new Request (uri, this.requestOptions);
        const data = await this.fetchPROTO(request, this.protoTypes, responseType);
        return data.titles.map(element => {
            return {
                id: element.tag,
                title : element.name.trim()
            };
        });
    }

    async _getChapters(manga) {
        const uri = new URL(`title?tag=${manga.id}`, this.api_url);
        const responseType = 'ComicZerosum.TitleView';
        const request = new Request(uri, this.requestOptions);
        const data = await this.fetchPROTO(request, this.protoTypes, responseType);
        return data.chapters.map(chapter => {
            return {
                id: chapter.id,
                title: chapter.name.trim()
            };
        });
    }

    async _getPages(chapter) {
        const uri = new URL(`viewer?chapter_id=${chapter.id}`, this.api_url);
        const responseType = 'ComicZerosum.MangaViewerView';
        const request = new Request(uri, {
            method: 'POST',
        });
        const data = await this.fetchPROTO(request, this.protoTypes, responseType);
        return data.pages.filter(page=> page.imageUrl).map(page => page.imageUrl);
    }

}
