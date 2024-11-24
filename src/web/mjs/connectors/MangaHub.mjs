import Connector from '../engine/Connector.mjs';
import Manga from '../engine/Manga.mjs';
import HeaderGenerator from '../engine/HeaderGenerator.mjs';
const { remote } = require('electron');

export default class MangaHub extends Connector {

    constructor() {
        super();
        super.id = 'mangahub';
        super.label = 'MangaHub';
        this.tags = [ 'manga', 'english' ];
        this.url = 'https://mangahub.io';
        this.apiURL = 'https://api2.mangahub.io/graphql';
        this.cdnURL = 'https://imgx.mghcdn.com';

        this.path = 'm01';
        this.requestOptions.headers.set('x-origin', this.url);
        this.requestOptions.headers.set('x-referer', `${this.url}/`);
        this.requestOptions.headers.set('Accept-Language', 'en-US,en;q=0.9');

        this.useReloadKeyParam = false;
    }

    async _initializeConnector() {
        await this._fetchApiKey(null, null);
        if (!this.requestOptions.headers.get('x-mhub-access')) {
            throw new Error(`${this.label}: Can't initialize the API key! Try selecting another manga from this connector!`);
        }
    }

    async _getMangaFromURI(uri) {
        const request = new Request(uri, this.requestOptions);
        request.headers.set('x-sec-fetch-dest', 'document');
        request.headers.set('x-sec-fetch-mode', 'navigate');
        request.headers.set('Upgrade-Insecure-Requests', 1);
        request.headers.delete('x-origin');
        request.headers.delete('x-mhub-access');
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
        request.headers.delete('x-mhub-access');
        const response = await fetch(request);
        let data = await response.blob();
        data = await this._blobToBuffer(data);
        this._applyRealMime(data);
        return data;
    }

    /******************/
    /* Begin MangaHub */
    /******************/

    _randomInteger(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    async _updateCookies(chapterNumber) {
        const now = Date.now();
        if (chapterNumber > 1) {
            chapterNumber -= 1;
        }
        const recently = {
            url: this.url,
            name: 'recently',
            value: encodeURIComponent(`{"${now - this._randomInteger(0, 1200)}":{"mangaID":${this._randomInteger(1, 30000)},"number":${chapterNumber}}}`),
            path: '/',
            expirationDate: now / 1000 + 3 * 31 * 24 * 60 * 60
        };
        await remote.session.defaultSession.cookies.set(recently);
    }

    async _getCookieValue(name) {
        let cookie = await remote.session.defaultSession.cookies.get({
            url: this.url,
            name: name,
            path: '/'
        });
        cookie = cookie.shift();
        return !cookie ? null : cookie.value;
    }

    async _fetchApiKey(mangaSlug, chapterNumber, stop = false) {
        this.requestOptions.headers.set('x-user-agent', HeaderGenerator.randomUA());
        let path = '';
        if (mangaSlug && chapterNumber) {
            await this._updateCookies(chapterNumber);
            path = `${this.url}/manga/${mangaSlug}`;
        } else {
            path = `${this.url}/`;
        }

        const uri = new URL(path);
        if (this.useReloadKeyParam)
            uri.searchParams.append('reloadKey', '1');
        const request = new Request(uri, this.requestOptions);
        request.headers.set('x-sec-fetch-dest', 'document');
        request.headers.set('x-sec-fetch-mode', 'navigate');
        request.headers.set('Upgrade-Insecure-Requests', 1);
        request.headers.delete('x-origin');
        request.headers.delete('x-mhub-access');

        const oldMhubAccess = await this._getCookieValue('mhub_access');

        await remote.session.defaultSession.cookies.remove(this.url, 'mhub_access');
        await fetch(request);

        const mhubAccess = await this._getCookieValue('mhub_access');

        if (!stop && (!mhubAccess || oldMhubAccess === mhubAccess)) {
            const oldKey = this.requestOptions.headers.get('x-mhub-access');
            this.useReloadKeyParam = !this.useReloadKeyParam;
            await this._fetchApiKey(null, null, true);
            if (!this.requestOptions.headers.get('x-mhub-access')) {
                this.requestOptions.headers.set('x-mhub-access', oldKey);
                throw new Error(`${this.label}: Can't update the API key!`);
            }
        } else {
            this.requestOptions.headers.set('x-mhub-access', mhubAccess);
        }
    }

    async fetchGraphQL(request, operationName, query, variables) {
        const initReloadKeyValue = this.useReloadKeyParam;

        for (let i = 0; i < 3; i++) {
            try {
                return await super.fetchGraphQL(request, operationName, query, variables);
            } catch(error) {
                if (error.message.includes(' errors: ') && /(api)?\s*rate\s*limit\s*(excessed)?|api\s*key\s*(invalid)?/i.test(error.message)) {
                    // In case they will give different expired API keys in cookies
                    if (i > 0 && initReloadKeyValue === this.useReloadKeyParam) {
                        this.useReloadKeyParam = !this.useReloadKeyParam;
                    } else if (i > 0) {
                        // We tried to update with and without 'reloadKey' parameter
                        // Therefore, we're throwing an error!
                        throw new Error(error.message);
                    }

                    let mangaSlug = query.match(/slug:\s*"(.+)"/);
                    if (mangaSlug) {
                        mangaSlug = mangaSlug[1];
                    }
                    let chapterNumber = query.match(/number:\s*(\d+)/);
                    if (chapterNumber) {
                        chapterNumber = chapterNumber[1];
                    }
                    await this._fetchApiKey(mangaSlug, chapterNumber);
                } else {
                    throw new Error(error.message);
                }
            }
        }
    }

    /*****************/
    /* END  MangaHub */
    /*****************/

}
