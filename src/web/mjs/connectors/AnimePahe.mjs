import Connector from '../engine/Connector.mjs';
import Manga from '../engine/Manga.mjs';
import Kwik from '../videostreams/Kwik.mjs';

export default class AnimePahe extends Connector {

    constructor() {
        super();
        super.id = 'animepahe';
        super.label = 'animepahe';
        this.tags = [ 'anime', 'subbed' ];
        this.url = 'https://animepahe.si';

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

    async _getChapters(manga) {
        let chapterList = [];
        for(let page = 1, run = true; run; page++) {
            let chapters = await this._getChaptersFromPage(manga.id, page);
            chapters.length > 0 ? chapterList.push(...chapters) : run = false;
        }
        return chapterList;
    }

    async _getChaptersFromPage(mangaID, page) {
        let uri = new URL('/api', this.url);
        uri.searchParams.set('m', 'release');
        uri.searchParams.set('id', mangaID);
        //uri.searchParams.set('session', mangaID);
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
        /*
        let uri = new URL('/api', this.url);
        uri.searchParams.set('m', 'links');
        uri.searchParams.set('id', chapter.id);
        //uri.searchParams.set('session', chapter.id);
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
        }, []);*/

        const url = new URL(`/play/${chapter.manga.id}/${chapter.id}`, this.url);
        const request = new Request(url, this.requestOptions);
        const data = await this.fetchDOM(request, 'div#resolutionMenu button');
        const streams = data.map(entry => {
            return {resolution : entry.dataset.resolution, url : entry.dataset.src};
        });

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
