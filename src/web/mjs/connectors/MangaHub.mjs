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
    }

    async _getGraphQL(gql) {
        this.requestOptions.method = 'POST';
        this.requestOptions.body = JSON.stringify({ query: gql });
        let request = new Request(this.apiURL, this.requestOptions);
        request.headers.set('content-type', 'application/json');
        this.requestOptions.headers.delete('content-type');
        delete this.requestOptions.body;
        this.requestOptions.method = 'GET';

        let data = await this.fetchJSON(request);
        if(data.errors) {
            throw new Error(this.label + ' errors: ' + data.errors.map(error => error.message).join('\n'));
        }
        if(!data.data) {
            throw new Error(this.label + 'No data available!');
        }
        return data.data;
    }

    async _getMangaFromURI(uri) {
        let request = new Request(uri, this.requestOptions);
        let data = await this.fetchDOM(request, 'div#mangadetail div.container-fluid div.row h1');
        let id = uri.pathname.split('/').pop();
        let title = data[0].firstChild.textContent.trim();
        return new Manga(this, id, title);
    }

    async _getMangas() {
        let gql = `{
            search(x: ${this.path}, q: "", genre: "all", mod: ALPHABET, limit: 99999) {
                rows {
                    id, slug, title
                }
            }
        }`;
        let data = await this._getGraphQL(gql);
        return data.search.rows.map(manga => {
            return {
                id: manga.slug, // manga.id
                title: manga.title
            };
        });
    }

    async _getChapters(manga) {
        let gql = `{
            manga(x: ${this.path}, slug: "${manga.id}") {
                chapters {
                    id, number, title, slug
                }
            }
        }`;
        let data = await this._getGraphQL(gql);
        return data.manga.chapters.map(chapter => {
            // .padStart( 4, '0' )
            let title = `Ch. ${chapter.number} - ${chapter.title}`;
            return {
                id: chapter.number, // chapter.id, chapter.slug,
                title: title.trim(),
                language: ''
            };
        });
    }

    async _getPages(chapter) {
        let gql = `{
            chapter(x: ${this.path}, slug: "${chapter.manga.id}", number: ${chapter.id}) {
                pages
            }
        }`;
        let data = await this._getGraphQL(gql);
        data = JSON.parse(data.chapter.pages);
        return Object.values(data).map(page => new URL(page, this.cdnURL).href);
    }
}