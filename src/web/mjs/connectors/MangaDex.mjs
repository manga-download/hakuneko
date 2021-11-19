import Connector from '../engine/Connector.mjs';
import Manga from '../engine/Manga.mjs';

export default class MangaDex extends Connector {

    constructor() {
        super();
        super.id = 'mangadex';
        super.label = 'MangaDex';
        this.tags = ['manga', 'high-quality', 'multi-lingual'];
        this.url = 'https://mangadex.org';
        this.api = 'https://api.mangadex.org';
        this.requestOptions.headers.set('x-referer', this.url);
        this.throttleGlobal = 100;
        this.licensedChapterGroups = [
            '4f1de6a2-f0c5-4ac5-bce5-02c7dbb67deb', // MangaPlus
            '8d8ecf83-8d42-4f8c-add8-60963f9f28d9' // Comikey
        ];
        this.serverNetwork = [
            'https://s2.mangadex.org/data/',
            'https://s5.mangadex.org/data/',
            'https://uploads.mangadex.org/data/'
        ];
    }

    async _initializeConnector() {
        this.serverNetwork.push('https://reh3tgm2rs8sr.xnvda7fch4zhr.mangadex.network/data/');
        this.serverNetwork.push('https://dj5jn4gz46ea6.xnvda7fch4zhr.mangadex.network/data/');
        console.log(`Added Network Seeds '[ ${this.serverNetwork.join(', ')} ]' to ${this.label}`);
        const request = new Request(this.url, this.requestOptions);
        return Engine.Request.fetchUI(request, '');
    }

    canHandleURI(uri) {
        // See: https://www.reddit.com/r/mangadex/comments/nn584s/list_of_appssites_that_currently_use_the_mangadex/
        return [
            /https?:\/\/mangadex\.org\/title\//,
            /https?:\/\/mangastack\.cf\/manga\//,
            /https?:\/\/manga\.ayaya\.red\/manga\//,
            /https?:\/\/(www\.)?chibiview\.app\/manga\//,
            /https?:\/\/cubari\.moe\/read\/mangadex\//
        ].some(regex => regex.test(uri.href));
    }

    async _getMangaFromURI(uri) {
        // NOTE: The MangaDex website is still down, but there are some provisional frontends which can be used for search, copy & paste
        const regexGUID = /[a-fA-F0-9]{8}-([a-fA-F0-9]{4}-){3}[a-fA-F0-9]{12}/;
        const id = (uri.pathname.match(regexGUID) || uri.hash.match(regexGUID))[0].toLowerCase();
        const request = new Request(new URL('/manga/' + id, this.api), this.requestOptions);
        const { data } = await this.fetchJSON(request);
        return new Manga(this, id, data.attributes.title.en || Object.values(data.attributes.title).shift());
    }

    async _getMangas() {
        let mangaList = [];
        let data1 = await this._getMangasFromPages(0, 99);
        mangaList = [...mangaList, ...data1.data];
        let nextAt = data1.nextAt;

        for (let i = 1; i <= data1.total / 10000; i += 1) {
            let data2 = await this._getMangasFromPages(0, 0, nextAt);
            mangaList = [...mangaList, ...data2.data.slice(1)];
            let pages = Math.min(Math.floor(data2.total / 100), 99);
            if (pages > 0) {
                let data3 = await this._getMangasFromPages(1, pages, nextAt);
                mangaList = [...mangaList, ...data3.data];
                nextAt = data3.nextAt;
            }
        }
        return mangaList.map(ele => {
            return {
                id: ele.id,
                title: ele.attributes.title.en || Object.values(ele.attributes.title).shift()
            };
        });
    }

    async _getMangasFromPages(start, pages, nextAt) {
        let tmp = [];
        for (let page = start; page <= pages; page += 1) {
            const uri = new URL('/manga', this.api);
            uri.searchParams.set('limit', 100);
            uri.searchParams.set('offset', 100 * page);
            uri.searchParams.set('order[createdAt]', 'asc');
            if (nextAt) uri.searchParams.set('createdAtSince', nextAt);
            const request = new Request(uri);
            let data3 = await this.fetchJSON(request, 3);
            await this.wait(this.throttleGlobal);
            tmp = [...tmp, ...data3.data];
            if (page == pages) {
                return {
                    data: tmp,
                    nextAt: data3.data[data3.data.length - 1].attributes.createdAt.match(/^\d{4}-[0-1]\d-([0-2]\d|3[0-1])T([0-1]\d|2[0-3]):[0-5]\d:[0-5]\d/)[0],
                    total: data3.total
                };
            }
        }
    }

    async _getChapters(manga) {
        let chapterList = [];
        for (let page = 0, run = true; run; page++) {
            let chapters = await this._getChaptersFromPage(manga, page);
            chapters.length > 0 ? chapterList.push(...chapters) : run = false;
        }
        return chapterList;
    }

    async _getChaptersFromPage(manga, page) {
        await this.wait(this.throttleGlobal);
        const uri = new URL('/chapter', this.api);
        uri.searchParams.set('limit', 100);
        uri.searchParams.set('offset', 100 * page);
        uri.searchParams.append('contentRating[]', 'safe');
        uri.searchParams.append('contentRating[]', 'suggestive');
        uri.searchParams.append('contentRating[]', 'erotica');
        uri.searchParams.append('contentRating[]', 'pornographic');
        uri.searchParams.set('manga', manga.id);
        const request = new Request(uri, this.requestOptions);
        const { data } = await this.fetchJSON(request, 3);
        const groupMap = await this._getScanlationGroups(data);
        return !data ? [] : data.map(result => {
            let title = '';
            if (result.attributes.volume) {
                title += 'Vol.' + this._padNum(result.attributes.volume, 2);
            }
            if (result.attributes.chapter) {
                title += ' Ch.' + this._padNum(result.attributes.chapter, 4);
            }
            if (result.attributes.title) {
                title += (title ? ' - ' : '') + result.attributes.title;
            }
            if (result.attributes.translatedLanguage) {
                title += ' (' + result.attributes.translatedLanguage + ')';
            }
            const groups = result.relationships.filter(r => r.type === 'scanlation_group');
            if (groups.length > 0) {
                title += ' [' + groups.map(group => groupMap[group.id]).join(', ') + ']';
            }
            // is any group for this chapter not in the list of licensed groups?
            if (groups.length === 0 || groups.some(group => !this.licensedChapterGroups.includes(group.id))) {
                return {
                    id: result.id,
                    title: title.trim(),
                    language: result.attributes.translatedLanguage
                };
            } else {
                return false;
            }
        }).filter(chapter => chapter);
    }

    async _getPages(chapter) {
        const uri = new URL('/chapter/' + chapter.id, this.api);
        const request = new Request(uri, this.requestOptions);
        const { data } = await this.fetchJSON(request, 3);
        const server = await this._getServerNode(chapter);
        return data.attributes.data.map(file => this.createConnectorURI({
            networkNode: server, // e.g. 'https://foo.bar.mangadex.network:44300/token/data/'
            hash: data.attributes.hash, // e.g. '1c41e55e32b21321ff11907469e5c323'
            file: file // e.g. 'x1-216a1435.png'
        }));
    }

    async _handleConnectorURI(payload) {
        const servers = [
            ...this.serverNetwork,
            payload.networkNode
        ];
        for (let node of servers) {
            try {
                const uri = new URL(node + payload.hash + '/' + payload.file);
                const request = new Request(uri, this.requestOptions);
                const response = await fetch(request);
                if (response.ok && response.status === 200) {
                    const data = await response.blob();
                    if (response.headers.get('content-length') == data.size) {
                        return this._blobToBuffer(data);
                    }
                }
            } finally {/**/ }
        }
        throw new Error('Failed to download image file from MangaDex@Home network!\n' + payload.networkNode);
    }

    async _getScanlationGroups(chapters) {
        const groupList = {};
        let groupIDs = !chapters ? {} : chapters.reduce((accumulator, chapter) => {
            const ids = chapter.relationships.filter(r => r.type === 'scanlation_group').map(g => g.id);
            return accumulator.concat(ids);
        }, []);
        groupIDs = Array.from(new Set(groupIDs));
        if (groupIDs.length > 0) {
            await this.wait(this.throttleGlobal);
            const uri = new URL('/group', this.api);
            uri.search = new URLSearchParams([['limit', 100], ...groupIDs.map(id => ['ids[]', id])]).toString();
            const request = new Request(uri, this.requestOptions);
            const { data } = await this.fetchJSON(request, 3);
            data.forEach(result => groupList[result.id] = result.attributes.name || 'unknown');
        }
        return groupList;
    }

    async _getServerNode(chapter) {
        const uri = new URL('/at-home/server/' + chapter.id, this.api);
        const request = new Request(uri, this.requestOptions);
        const data = await this.fetchJSON(request, 3);
        return data.baseUrl + '/data/';
    }

    _padNum(number, places) {
        /*
         * '17'
         * '17.5'
         * '17-17.5'
         * '17 - 17.5'
         * '17-123456789'
         */
        let range = number.split('-');
        range = range.map(chapter => {
            chapter = chapter.trim();
            let digits = chapter.split('.')[0].length;
            return '0'.repeat(Math.max(0, places - digits)) + chapter;
        });
        return range.join('-');
    }

    fetchJSON( request, retries ) {
        retries = retries || 0;
        if( typeof request === 'string' ) {
            request = new Request( request, this.requestOptions );
        }
        // TODO: check if this will affect (replace) the input parameter?
        if( request instanceof URL ) {
            request = new Request( request.href, this.requestOptions );
        }
        return fetch( request )
            .then( response => {
                if( (response.status >= 500 || response.status == 404) && retries > 0 ) {
                    return this.wait( 500 )
                        .then( () => this.fetchJSON( request, retries - 1 ) );
                }
                if( response.status === 200 ) {
                    return response.json();
                }
                throw new Error( `Failed to receive content from "${request.url}" (status: ${response.status}) - ${response.statusText}` );
            } );
    }
}