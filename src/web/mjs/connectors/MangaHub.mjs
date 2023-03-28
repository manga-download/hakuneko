import Connector from '../engine/Connector.mjs';
import Manga from '../engine/Manga.mjs';

export default class MangaHub extends Connector {

    constructor() {
        super();
        super.id = 'mangahub';
        super.label = 'MangaHub';
        this.tags = [ 'manga', 'english' ];
        this.url = 'https://mangahub.io';
        this.apiURL = 'https://api.mghubcdn.com/graphql';
        this.cdnURL = 'https://img.mghubcdn.com/file/imghub/';

        this.path = 'm01';
        this.requestOptions.headers.set('x-origin', this.url);
        this.requestOptions.headers.set('x-referer', `${this.url}/`);
        this.requestOptions.headers.set('Accept-Language', 'en-US,en;q=0.9');
    }

    async _getMangaFromURI(uri) {
        const request = new Request(uri, this.requestOptions);
        request.headers.set('x-sec-fetch-dest', 'document');
        request.headers.set('x-sec-fetch-mode', 'navigate');
        request.headers.set('Upgrade-Insecure-Requests', 1);
        request.headers.delete('x-origin');
        const data = await this.fetchDOM(request, 'div#mangadetail div.container-fluid div.row h1');
        const id = uri.pathname.split('/').filter(e => e).pop();
        const title = data[0].firstChild.textContent.trim();
        return new Manga(this, id, title);
    }

    async _getMangas() {
        const gql = `{
            search(x: ${this.path}, q: "", genre: "all", mod: ALPHABET, limit: 99999) {
                rows {
                    id, slug, title
                }
            }
        }`;
        const data = await this.fetchGraphQL(this.apiURL, undefined, gql, undefined);
        return data.search.rows.map(manga => {
            return {
                id: manga.slug, // manga.id
                title: manga.title
            };
        });
    }

    async _getChapters(manga) {
        const gql = `{
            manga(x: ${this.path}, slug: "${manga.id}") {
                chapters {
                    id, number, title, slug
                }
            }
        }`;
        const data = await this.fetchGraphQL(this.apiURL, undefined, gql, undefined);
        return data.manga.chapters.map(chapter => {
            const title = `Ch. ${chapter.number} - ${chapter.title}`;
            return {
                id: chapter.number, // chapter.id, chapter.slug,
                title: title.trim(),
                language: ''
            };
        });
    }

    async _getPages(chapter) {
        const gql = `{
            chapter(x: ${this.path}, slug: "${chapter.manga.id}", number: ${chapter.id}) {
                pages
            }
        }`;
        let data = await this.fetchGraphQL(this.apiURL, undefined, gql, undefined);
        data = JSON.parse(data.chapter.pages);
        return data.i.map(page => this.createConnectorURI(new URL(data.p + page, this.cdnURL).href));
    }

    async _handleConnectorURI(payload) {
        const request = new Request(payload, this.requestOptions);
        request.headers.set('x-sec-fetch-dest', 'image');
        request.headers.set('x-sec-fetch-mode', 'no-cors');
        request.headers.delete('x-origin');
        const response = await fetch(request);
        let data = await response.blob();
        data = await this._blobToBuffer(data);
        this._applyRealMime(data);
        return data;
    }
}
