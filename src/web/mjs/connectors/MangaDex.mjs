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
        // Private members for internal use that can be configured by the user through settings menu (set to undefined or false to hide from settings menu!)
        this.config = {
            node: {
                label: 'Image Server',
                description: [
                    'Select the MD@Home mirror from which the images should be downloaded.',
                    'You can either get a random unofficial mirror (hosted by an unknown user),',
                    'or choose one of the official mirrors (hosted by MangaDex staff).',
                    '',
                    'There is a risk that unofficial mirrors may log your data / provide malicious images.'
                ].join('\n'),
                input: 'select',
                options: [
                    { value: '', name: 'Random Mirror (unofficial)' },
                    { value: 'https://s2.mangadex.org', name: 's2.mangadex.org (US)' },
                    { value: 'https://s3.mangadex.org', name: 's3.mangadex.org (DE)' },
                    { value: 'https://s5.mangadex.org', name: 's5.mangadex.org (US)' },
                    { value: 'https://s2.mangadex.cf', name: 's2.mangadex.cf (CloudFlare CDN)' },
                    { value: 'https://s5.mangadex.cf', name: 's5.mangadex.cf (CloudFlare CDN)' }
                ],
                value: 'https://s2.mangadex.org'
            },
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
        /*
         * '/api/manga/7938'
         * '/api/?type=manga&id=7938'
         */
        let data = await this._requestAPI(new URL('/api/manga/' + this._migratedMangaID(manga.id), this.url), 'chapter');
        return Object.keys(data.chapter).map(id => {
            let chapter = data.chapter[id];
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
            if(chapter.lang_code) {
                title += ' (' + chapter.lang_code + ')';
            }
            if(chapter.group_name) {
                title += ' [' + chapter.group_name + ']';
            }
            return {
                id: id,
                title: title.trim(),
                language: chapter.lang_code
            };
        });
    }

    async _getPages(chapter) {
        /*
         * '/api/chapter/778765'
         * '/api/?server=null&type=chapter&id=778765'
         */
        let data = await this._requestAPI(new URL('/api/chapter/' + chapter.id, this.url), 'page');
        let baseURL = this._getNode(data.server) + data.hash + '/';
        return data.page_array.map(page => this.createConnectorURI(baseURL + page));
    }

    _getNode(server) {
        let uri = new URL(server, this.url);
        // images that are still hosted on mangadex.org are not yet available in MD@Home infrastructure
        if(uri.origin === this.url || !this.config.node.value) {
            return uri.href;
        }
        // Use new CloudFlare CDN domain instead of old CloudFlare CDN domain
        if(this.config.node.value.includes('hakuneko.download')) {
            this.config.node.value = 'https://s2.mangadex.cf';
        }
        return new URL('/data/', this.config.node.value).href;
    }

    async _requestAPI(url, label) {
        let request = new Request(url, this.requestOptions);
        let data = await this.fetchJSON(request);
        if(data.status.toLowerCase() !== 'ok') {
            let message = data.status === 'external' ? 'External reference: ' + data.external : data[ 'message' ] || 'No information available';
            throw new Error(`Failed to receive ${label} list (status: ${data.status})\n${message}`);
        }
        return data;
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