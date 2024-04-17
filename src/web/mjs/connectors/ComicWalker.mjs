import Connector from '../engine/Connector.mjs';
import Manga from '../engine/Manga.mjs';

export default class ComicWalker extends Connector {

    constructor() {
        super();
        super.id = 'comicwalker';
        super.label = 'カドコミ (KadoComi)';
        this.tags = [ 'manga', 'japanese' ];
        this.url = 'https://comic-walker.com';
        this.apiURL = 'https://comic-walker.com/api/';
    }

    async _getMangaFromURI(uri) {
        const workCode = uri.pathname.match(/\/detail\/([^/]+)/)[1]; //strip search
        const apiCallUrl = new URL(`contents/details/work?workCode=${workCode}`, this.apiURL);
        const { work } = await this.fetchJSON(new Request(apiCallUrl, this.requestOptions));
        return new Manga(this, workCode, work.title.trim());
    }

    async _getMangas() {
        const mangasList = [];
        const apiCallUrl = new URL(`search/initial`, this.apiURL);
        const data = await this.fetchJSON(new Request(apiCallUrl, this.requestOptions));
        for (const entry of data) {
            mangasList.push(...entry.items.map(manga => {
                return {
                    id: manga.code,
                    title: manga.title.trim()
                };
            }));
        }
        return mangasList;
    }

    async _getChapters( manga ) {
        const chapterList = [];
        const apiCallUrl = new URL(`contents/details/work?workCode=${manga.id}`, this.apiURL);
        const data = await this.fetchJSON(new Request(apiCallUrl, this.requestOptions));

        for (const episodeType of ['firstEpisodes', 'latestEpisodes' ]) {

            chapterList.push(...data[episodeType].result.map(episode => {
                const title = [episode.title, episode.subtitle].join(' ').trim();
                return { id: episode.id, title :  title};
            }));
        }

        for (const comic of data.comics.result) {
            chapterList.push(...comic.episodes.map(episode => {
                return {
                    id: episode.id,
                    title : episode.title.trim()
                };
            }));
        }

        return chapterList.filter(chapter => chapter === chapterList.find(c => c.id === chapter.id));

    }

    async _getPages( chapter ) {
        const apiCallUrl = new URL(`contents/viewer?episodeId=${chapter.id}&imageSizeType=width:1284`, this.apiURL);
        const { manuscripts } = await this.fetchJSON(new Request(apiCallUrl, this.requestOptions));
        return manuscripts.map(page => this.createConnectorURI({ ...page }));
    }

    async _handleConnectorURI(payload) {
        const uri = new URL(payload.drmImageUrl, this.url);
        const request = new Request(uri, this.requestOptions);
        const response = await fetch(request);
        switch (payload.drmMode) {
            case 'xor': {
                const encrypted = await response.arrayBuffer();
                const data = {
                    mimeType: response.headers.get('content-type'),
                    data: this._xor(encrypted, this._generateKey(payload.drmHash))
                };
                this._applyRealMime(data);
                return data;
            }
            case 'raw': {
                const data = await response.blob();
                return this._blobToBuffer(data);
            }
        }
    }

    /**
     ******************************
     * ** COMIC-WALKER CODE BEGIN ***
     *****************************
     */

    _generateKey(t) {
        var e = t.slice(0, 16).match(/[\da-f]{2}/gi);
        if (null != e)
            return new Uint8Array(e.map(function(t) {
                return parseInt(t, 16);
            }));
        throw new Error("failed generate key.");
    }

    _xor(t, e) {
        for (var n = new Uint8Array(t), r = n.length, i = e.length, o = new Uint8Array(r), a = 0; a < r; a += 1)
            o[a] = n[a] ^ e[a % i];
        return o;
    }

    /**
     ****************************
     * ** COMIC-WALKER CODE END ***
     ***************************
     */
}
