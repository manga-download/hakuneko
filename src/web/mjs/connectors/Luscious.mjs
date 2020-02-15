import Connector from '../engine/Connector.mjs';
import Manga from '../engine/Manga.mjs';

export default class Luscious extends Connector {

    constructor() {
        super();
        super.id = 'luscious';
        super.label = 'Luscious';
        this.tags = [ 'hentai', 'multi-lingual' ];
        this.url = 'https://www.luscious.net';
        this.apiURL = 'https://api.luscious.net/graphql/nobatch/';
    }

    async _getMangaFromURI(uri) {
        let request = new Request(uri, this.requestOptions);
        let data = await this.fetchDOM(request, 'head title');
        let id = uri.pathname;
        let title = data[0].textContent.split('|')[0].trim() + ` [${data[0].lang}]`;
        return new Manga(this, id, title);
    }

    async _getGraphQL(gql) {
        let uri = new URL(this.apiURL);
        uri.searchParams.set('query', gql);
        let request = new Request(uri, this.requestOptions);
        let data = await this.fetchJSON(request);
        if(data.errors) {
            throw new Error(this.label + ' errors: ' + data.errors.map(error => error.message).join('\n'));
        }
        if(!data.data) {
            throw new Error(this.label + 'No data available!');
        }
        return data.data;
    }

    async _getMangas() {
        let mangaList = [];
        for(let page = 1, run = true; run; page++) {
            let mangas = await this._getMangasFromPage(page);
            mangas.length > 0 ? mangaList.push(...mangas) : run = false;
        }
        return mangaList;
    }

    async _getMangasFromPage(page) {
        let gql = `{
            album {
                list(input: { display: date_newest, page: ${page} }) {
                    items { url, title }
                }
            }
        }`;
        let data = await this._getGraphQL(gql);
        return data.album.list.items.map(item => {
            return {
                id: this.getRootRelativeOrAbsoluteLink(item.url, this.url),
                title: item.title.trim()
            };
        });
    }

    async _getChapters(manga) {
        return [ {
            id: manga.id,
            title: manga.title,
            language: ''
        } ];
    }

    async _getPagesFromPage(chapter, page) {
        let part = chapter.id.split('/').filter(part => part !== '').pop();
        let path = ['', 'pictures', 'album', part, 'sorted', 'position', 'page', page, ''].join('/');
        let request = new Request(new URL(path, this.url), this.requestOptions);
        try {
            let data = await this.fetchDOM(request, 'div.picture_page div.thumbnail source.safe_link');
            return data.map(element => this.createConnectorURI(this.getAbsolutePath(element.dataset.src.replace(/\.\d+x\d+\.jpg/, ''), request.url)));
        } catch(error) {
            // catch 404 error when page number exceeds available pages
            return [];
        }
    }

    async _getPages(chapter) {
        let pageList = [];
        for(let page = 1, run = true; run; page++) {
            let pages = await this._getPagesFromPage(chapter, page);
            pages.length > 0 ? pageList.push(...pages) : run = false;
        }
        return pageList;
    }

    async _handleConnectorURI(payload) {
        let promises = ['.png', '.jpg'].map(extension => {
            let request = new Request(payload + extension, this.requestOptions);
            return fetch(request);
        });
        let responses = await Promise.all(promises);
        let response = responses.find(response => response.ok);
        return {
            mimeType: response.headers.get('content-type'),
            data: new Uint8Array(await response.arrayBuffer())
        };
    }
}