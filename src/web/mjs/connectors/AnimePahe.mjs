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
            }
        };
    }

    async _getMangaFromURI(uri) {
        let request = new Request(uri, this.requestOptions);
        let data = await this.fetchDOM(request, 'div#modalBookmark div.modal-body div a[href*="pahe.win/a"]');
        let id = uri.pathname;
        let title = data[0].text.trim();
        return new Manga(this, id, title);
    }

    async _getMangas() {
        let uri = new URL('/anime', this.url);
        let request = new Request(uri, this.requestOptions);
        let data = await this.fetchDOM(request, 'div.tab-content div.row a');
        return data.map(element => {
            return {
                id: element.pathname,
                title: element.text.trim()
            };
        });
    }

    async _getChapters(manga) {
        let chapterList = [];
        let uri = new URL(manga.id, this.url);
        let request = new Request(uri, this.requestOptions);
        let data = await this.fetchDOM(request, 'div#modalBookmark div.modal-body div a[href*="pahe.win/a"]');
        let id = parseInt(data[0].pathname.split('/').pop());
        for(let page = 1, run = true; run; page++) {
            let chapters = await this._getChaptersFromPage(manga, id, page);
            chapters.length > 0 ? chapterList.push(...chapters) : run = false;
        }
        return chapterList;
    }

    async _getChaptersFromPage(manga, id, page) {
        let uri = new URL('/api', this.url);
        uri.searchParams.set('m', 'release');
        uri.searchParams.set('id', id);
        uri.searchParams.set('page', page);
        //uri.searchParams.set('l', 30); // limit
        //uri.searchParams.set('sort', 'episode_desc');
        let request = new Request(uri, this.requestOptions);
        let data = await this.fetchJSON(request);
        if(data.current_page > data.last_page) {
            return [];
        }
        return data.data.map(item => {
            let title = item.episode;
            title += item.episode2 > 0 ? '.' + item.episode2 : '';
            title += item.title ? ' - ' + item.title : '';
            return {
                id: `/api?m=links&id=${id}&session=${item.session}&p=kwik`,
                title: title,
                language: ''
            };
        });
    }

    async _getPages(chapter) {
        let resolution = parseInt(this.config.resolution.value || 0);
        let uri = new URL(chapter.id, this.url);
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
        let stream = streams.find(stream => stream.resolution >= resolution) || streams.shift();
        let kwik = new Kwik(stream.url, this.url);
        let playlist = await kwik.getPlaylist();
        return {
            hash: 'id,language,resolution',
            mirrors: [ playlist ],
            referer: stream.url,
            subtitles: []
        };
    }
}