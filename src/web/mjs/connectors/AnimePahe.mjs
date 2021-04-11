import Connector from '../engine/Connector.mjs';
import Manga from '../engine/Manga.mjs';
import Kwik from '../videostreams/Kwik.mjs';

export default class AnimePahe extends Connector {

    constructor() {
        super();
        super.id = 'animepahe';
        super.label = 'animepahe';
        this.tags = [ 'anime', 'subbed' ];
        this.url = 'https://animepahe.com';

        this.config = {
            resolution:  {
                label: 'Preferred Resolution',
                description: 'Try to download video in the selected resolution.\nIf the resolution is not supported, depending on the mirror the download may fail, or a fallback resolution may be used!',
                input: 'select',
                options: [
                    { value: '', name: 'Mirror\'s Default' },
                    { value: '720', name: '720p' },
                    { value: '1080', name: '1080p' }
                ],
                value: ''
            },
            throttle: {
                label: 'Video Stream Throttle [ms]',
                description: 'Enter the timespan in [ms] to delay consecuitive HTTP requests while downloading packets from the video stream.\nThe download may fail if there are too many packets requested within a certain interval.',
                input: 'numeric',
                min: 100,
                max: 10000,
                value: 1000
            }
        };
    }

    async _getMangaFromURI(uri) {
        let request = new Request(uri, this.requestOptions);
        let data = await this.fetchDOM(request, 'div#modalBookmark div.modal-body div a[href*="pahe.win/a"]');
        let title = data[0].title.trim();
        let id = uri.pathname.split('/').pop();
        return new Manga(this, id, title);
    }

    async _getMangas() {
        let mangaList = [];
        let uri = new URL('/anime', this.url);
        let request = new Request(uri, this.requestOptions);
        let data = await this.fetchDOM(request, 'div.tab-content div.row a');
        for(let element of data) {
            this.cfMailDecrypt(element);
            let title = element.text.trim();
            mangaList.push({
                id: element.pathname.split('/').pop(),
                title: title
            });
        }
        return mangaList;
    }

    async _getRealMangaID(manga) {
        const uri = new URL('/api', this.url);
        uri.searchParams.set('m', 'search');
        uri.searchParams.set('l', 8);
        uri.searchParams.set('q', manga.title);
        const request = new Request(uri, this.requestOptions);
        const data = await this.fetchJSON(request);
        if(data.data.length === 1) {
            return data.data[0].id;
        }
        const matchesByTitle = data.data.filter(entry => entry.title === manga.title);
        if(matchesByTitle.length === 1) {
            return matchesByTitle[0].id;
        }
        const matchesBySession = data.data.filter(entry => entry.session === manga.id);
        if(matchesBySession.length === 1) {
            return matchesBySession[0].id;
        }
        throw new Error('Failed to find the real ID for the given anime!', manga);
    }

    async _getChapters(manga) {
        let chapterList = [];
        const mangaID = await this._getRealMangaID(manga);
        for(let page = 1, run = true; run; page++) {
            let chapters = await this._getChaptersFromPage(mangaID, page);
            chapters.length > 0 ? chapterList.push(...chapters) : run = false;
        }
        return chapterList;
    }

    async _getChaptersFromPage(mangaID, page) {
        let uri = new URL('/api', this.url);
        uri.searchParams.set('m', 'release');
        uri.searchParams.set('id', mangaID);
        uri.searchParams.set('session', mangaID);
        uri.searchParams.set('page', page);
        //uri.searchParams.set('l', 30); // limit
        //uri.searchParams.set('sort', 'episode_desc');
        let request = new Request(uri, this.requestOptions);
        let data = await this.fetchJSON(request);
        if(!data.data || data.current_page > data.last_page) {
            return [];
        }
        return data.data.map(item => {
            let title = item.episode;
            title += item.episode2 > 0 ? '.' + item.episode2 : '';
            title += item.title ? ' - ' + item.title : '';
            return {
                id: item.session, // item.id
                title: title,
                language: ''
            };
        });
    }

    async _getPages(chapter) {
        const mangaID = await this._getRealMangaID(chapter.manga);
        let uri = new URL('/api', this.url);
        uri.searchParams.set('m', 'links');
        uri.searchParams.set('id', mangaID);
        uri.searchParams.set('session', chapter.id);
        uri.searchParams.set('p', 'kwik');
        let request = new Request(uri, this.requestOptions);
        let data = await this.fetchJSON(request);
        let streams = data.data.reduce((accumulator, entry) => {
            let links = Object.keys(entry).map(key => {
                return {
                    resolution: parseInt(key),
                    url: entry[key].kwik
                };
            });
            return accumulator.concat(links);
        }, []);
        let resolution = parseInt(this.config.resolution.value || 0);
        let stream = streams.find(stream => stream.resolution >= resolution) || streams.shift();
        let kwik = new Kwik(stream.url, this.url);
        return {
            hash: 'id,language,resolution',
            mirrors: [ await kwik.getPlaylist() ],
            referer: stream.url,
            subtitles: []
        };
        /*
        return {
            video: await kwik.getStream(),
            subtitles: []
        };
        */
    }
}