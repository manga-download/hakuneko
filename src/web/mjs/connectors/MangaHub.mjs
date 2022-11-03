import Connector from '../engine/Connector.mjs';
import Cookie from '../engine/Cookie.mjs';
import HeaderGenerator from '../engine/HeaderGenerator.mjs';
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

    _randomInteger(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    async _updateCookies(chapterNumber) {
        const { remote } = require('electron');

        const now = new Date().getTime();
        if (chapterNumber > 1) {
            chapterNumber -= 1;
        }
        const recently = {
            url: this.url,
            name: 'recently',
            value: encodeURIComponent(`{"${now - this._randomInteger(0, 1200)}":{"mangaID":${this._randomInteger(1, 30000)},"number":${chapterNumber}}}`),
            path: '/',
            expirationDate: now + 2 * 31 * 24 * 60 * 60 * 1000
        };
        await remote.session.defaultSession.cookies.set(recently);
    }

    async _fetchApiKey(mangaSlug, chapterNumber) {
        this.requestOptions.headers.set('x-user-agent', HeaderGenerator.randomUA());
        let path = '';
        if (mangaSlug && chapterNumber) {
            await this._updateCookies(chapterNumber);
            path = `${this.url}/manga/${mangaSlug}`;
        } else {
            path = `${this.url}/`;
        }
        const uri = new URL(path);
        uri.searchParams.append('reloadKey', '1');
        const request = new Request(uri, this.requestOptions);
        request.headers.set('x-sec-fetch-dest', 'document');
        request.headers.set('x-sec-fetch-mode', 'navigate');
        request.headers.set('Upgrade-Insecure-Requests', 1);
        request.headers.delete('x-origin');
        request.headers.delete('x-mhub-access');
        const response = await fetch(request);
        const cookie = new Cookie(response.headers.get('x-set-cookie'));

        if (mangaSlug && chapterNumber && !cookie.get('mhub_access')) {
            const oldKey = this.requestOptions.headers.get('x-mhub-access');
            await this._fetchApiKey(null, null);
            if (!this.requestOptions.headers.get('x-mhub-access')) {
                this.requestOptions.headers.set('x-mhub-access', oldKey);
                throw new Error(`${this.label}: Can't update the API key!`);
            }
        } else {
            this.requestOptions.headers.set('x-mhub-access', !cookie.get('mhub_access') ? '' : cookie.get('mhub_access'));
        }
    }

    async _initializeConnector() {
        await this._fetchApiKey(null, null);
        if (!this.requestOptions.headers.get('x-mhub-access')) {
            throw new Error(`${this.label}: Can't initialize the API key! Try selecting another manga from this connector!`);
        }
    }

    async _fetchGraphQLWithoutRateLimit(request, operationName, query, variables) {
        try {
            const data = await this.fetchGraphQL(request, operationName, query, variables);
            return data;
        } catch(error) {
            if (error.message.includes(' errors: ') && /(api)?\s*rate\s*limit\s*(excessed)?|api\s*key\s*(invalid)?/i.test(error.message)) {
                let mangaSlug = query.match(/slug:\s*"(.+)"/);
                if (mangaSlug) {
                    mangaSlug = mangaSlug[1];
                }
                let chapterNumber = query.match(/number:\s*(\d+)/);
                if (chapterNumber) {
                    chapterNumber = chapterNumber[1];
                }
                await this._fetchApiKey(mangaSlug, chapterNumber);
                const data = await this.fetchGraphQL(request, operationName, query, variables);
                return data;
            } else {
                throw new Error(error.message);
            }
        }
    }

    async _getMangaFromURI(uri) {
        let request = new Request(uri, this.requestOptions);
        request.headers.set('x-sec-fetch-dest', 'document');
        request.headers.set('x-sec-fetch-mode', 'navigate');
        request.headers.set('Upgrade-Insecure-Requests', 1);
        request.headers.delete('x-origin');
        request.headers.delete('x-mhub-access');
        let data = await this.fetchDOM(request, 'div#mangadetail div.container-fluid div.row h1');
        let id = uri.pathname.split('/').filter(e => e).pop();
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
        let data = await this._fetchGraphQLWithoutRateLimit(this.apiURL, undefined, gql, undefined);
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
        let data = await this._fetchGraphQLWithoutRateLimit(this.apiURL, undefined, gql, undefined);
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
        let data = await this._fetchGraphQLWithoutRateLimit(this.apiURL, undefined, gql, undefined);
        data = JSON.parse(data.chapter.pages);
        return Object.values(data).map(page => this.createConnectorURI(new URL(page, this.cdnURL).href));
    }

    async _handleConnectorURI(payload) {
        let request = new Request(payload, this.requestOptions);
        request.headers.set('x-sec-fetch-dest', 'image');
        request.headers.set('x-sec-fetch-mode', 'no-cors');
        request.headers.delete('x-origin');
        request.headers.delete('x-mhub-access');
        let response = await fetch(request);
        let data = await response.blob();
        data = await this._blobToBuffer(data);
        this._applyRealMime(data);
        return data;
    }
}