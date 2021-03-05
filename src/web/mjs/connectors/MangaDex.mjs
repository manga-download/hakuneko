import Connector from '../engine/Connector.mjs';
import Manga from '../engine/Manga.mjs';

export default class MangaDex extends Connector {

    constructor() {
        super();
        super.id = 'mangadex';
        super.label = 'MangaDex';
        this.tags = [ 'manga', 'high-quality', 'multi-lingual' ];
        this.url = 'https://mangadex.org';
        this.requestOptions.headers.set('x-cookie', 'mangadex_h_toggle=1; mangadex_title_mode=2');
        this.requestOptions.headers.set('x-referer', this.url);
        this.licensedChapterGroups = [
            9097 // MangaPlus
        ];
        this.serverPrimary = 'https://s2.mangadex.org/data/';
        this.serverSecondary = 'https://s5.mangadex.org/data/';
        this.serverNetwork = [];

        // Private members for internal use that can be configured by the user through settings menu (set to undefined or false to hide from settings menu!)
        this.config = {
            throttle: {
                label: 'Throttle Requests [ms]',
                description: 'Enter the timespan in [ms] to delay consecuitive HTTP requests.\nThe website may ban your IP for to many consecuitive requests.',
                input: 'numeric',
                min: 500,
                max: 5000,
                value: 2500
            }
        };
    }

    async _initializeConnector() {
        // TODO: determine seed from remote service?
        this.serverNetwork.push('https://d156gdtycsqca.xnvda7fch4zhr.mangadex.network:443/data/');
        console.log(`Added Network Seeds '[ ${this.serverNetwork.join(', ')} ]' to ${this.label}`);
        /*
         * sometimes cloudflare bypass will fail, because chrome successfully loads the page from its cache
         * => append random search parameter to avoid caching
         */
        let uri = new URL(this.url);
        uri.searchParams.set('ts', Date.now());
        uri.searchParams.set('rd', Math.random());
        let request = new Request(uri.href, this.requestOptions);
        return Engine.Request.fetchUI(request, '');
    }

    async _getMangaFromURI(uri) {
        let request = new Request(uri, this.requestOptions);
        let data = await this.fetchDOM(request, 'div.card h6.card-header span.mx-1', 3);
        let id = uri.pathname.match(/\/(\d+)\/?/)[1];
        let title = data[0].innerText.trim();
        return new Manga(this, id, title);
    }

    async _getMangas() {
        let mangaList = [];
        for(let page = 1, run = true; run; page++) {
            await this.wait(this.config.throttle.value);
            let mangas = await this._getMangasFromPage(page);
            mangas.length > 0 ? mangaList.push(...mangas) : run = false;
        }
        return mangaList;
    }

    async _getMangasFromPage(page) {
        let request = new Request(new URL(`/titles/2/${page}/`, this.url), this.requestOptions);
        let data = await this.fetchDOM(request, 'div.manga-entry div.row div.text-truncate a.manga_title');
        return data.map(element => {
            this.cfMailDecrypt(element);
            return {
                id: element.href.match(/\/(\d+)\//)[1],
                title: element.text.trim()
            };
        });
    }

    async _getChapters(manga) {
        const uri = new URL(`/api/v2/manga/${this._migratedMangaID(manga.id)}/chapters`, this.url);
        const request = new Request(uri);
        const data = await this.fetchJSON(request, 3);
        return data.data.chapters
            .filter(chapter => !this.licensedChapterGroups.some(id => chapter.groups.includes(id)))
            .map(chapter => {
                let title = '';
                if(chapter.volume) { // => string, not a number
                    title += 'Vol.' + this._padNum(chapter.volume, 2);
                }
                if(chapter.chapter) { // => string, not a number
                    title += ' Ch.' + this._padNum(chapter.chapter, 4);
                }
                if(chapter.title) {
                    title += (title ? ' - ' : '') + chapter.title;
                }
                if(chapter.language) {
                    title += ' (' + chapter.language + ')';
                }
                if(chapter.groups.length) {
                    const getGroup = groupID => {
                        const group = data.data.groups.find(g => g.id === groupID);
                        return group ? group.name : 'unknown';
                    };
                    title += ' [' + chapter.groups.map(getGroup).join(', ') + ']';
                }
                return {
                    id: chapter.id,
                    title: title.trim(),
                    language: chapter.language
                };
            });
    }

    async _getPages(chapter) {
        const uri = new URL(`/api/v2/chapter/${chapter.id}`, this.url);
        uri.searchParams.set('mark_read', false);
        uri.searchParams.set('saver', false);
        const request = new Request(uri);
        const data = await this.fetchJSON(request, 3);
        return data.data.pages.map(file => this.createConnectorURI({
            networkNode: data.data.server, // e.g. 'https://foo.bar.mangadex.network:44300/token/data/'
            serverFallback: data.data.serverFallback, // e.g. 'https://s2.mangadex.org/data/'
            hash: data.data.hash, // e.g. '1c41e55e32b21321ff11907469e5c323'
            file: file // e.g. '123.png'
        }));
    }

    async _handleConnectorURI(payload) {
        const servers = [
            this.serverPrimary,
            this.serverSecondary,
            ...this.serverNetwork,
            payload.serverFallback,
            payload.networkNode
        ];
        for(let node of servers) {
            try {
                const uri = new URL(node + payload.hash + '/' + payload.file);
                let request = new Request(uri, this.requestOptions);
                let response = await fetch(request);
                if(response.status === 200) {
                    let data = await response.blob();
                    return this._blobToBuffer(data);
                }
            } finally {/**/}
        }
        throw new Error('');
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
        range = range.map( chapter => {
            chapter = chapter.trim();
            let digits = chapter.split('.')[0].length;
            return '0'.repeat(Math.max(0, places - digits)) + chapter;
        } );
        return range.join('-');
    }

    // Try to convert old manga IDs to the latest version (e.g. when stored as bookmark).
    _migratedMangaID(mangaID) {
        // /manga/8466/darwin-s-game
        let v1 = mangaID.match(/^\/manga\/(\d+)\/.*$/);
        if(v1) {
            return v1[1];
        }
        let v2 = mangaID.match(/^\d+$/);
        if(v2) {
            return v2[0];
        }
        return mangaID;
    }
}