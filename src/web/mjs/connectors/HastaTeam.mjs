import Connector from '../engine/Connector.mjs';

export default class HastaTeam extends Connector {

    constructor() {
        super();

        super.id = 'hastateam';
        super.label = 'Hasta Team';

        this.tags = [ 'manga', 'high-quality', 'italian', 'scanlation' ];

        this.url = 'https://reader.hastateam.com/';

        this.language = 'italian';
    }

    async _getMangas() {
        const uri = new URL('/api/comics', this.url);
        const request = new Request(uri, this.requestOptions);

        const response = await fetch(request);
        const data = await response.json();

        return data.comics.map(comic => ({
            id: comic.url,
            title: comic.title
        }));
    }

    async _getChapters(manga) {
        const comicUrl = new URL(manga.id, this.url);
        const apiUrl = new URL(
            `/api${comicUrl.pathname}`,
            this.url
        );

        const request = new Request(apiUrl, this.requestOptions);
        const response = await fetch(request);
        const data = await response.json();

        return data.comic.chapters.map(chapter => ({
            id: chapter.url,
            title: chapter.full_title
        }));
    }

    async _getPages(chapter) {
        const chapterUrl = new URL(chapter.id, this.url);
        const apiUrl = new URL(
            `/api${chapterUrl.pathname}`,
            this.url
        );

        const request = new Request(apiUrl, this.requestOptions);
        const response = await fetch(request);
        const data = await response.json();

        const referer = chapterUrl.href;

        return data.chapter.pages.map(page => {
            return this.createConnectorURI({
                url: page,
                referer
            });
        });
    }

    async _handleConnectorURI(payload) {
        const request = new Request(payload.url, this.requestOptions);

        request.headers.set('x-referer', payload.referer);

        const response = await fetch(request);
        const data = await response.blob();

        return this._blobToBuffer(data);
    }
}