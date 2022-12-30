import Connector from '../engine/Connector.mjs';
import Manga from '../engine/Manga.mjs';
export default class AnimeParadise extends Connector {
    constructor() {
        super();
        super.id = 'animeparadise';
        super.label = 'Anime Paradise';
        this.tags = [ 'anime', 'subbed', 'multi-lingual' ];
        this.url = 'https://www.animeparadise.moe';
        this.api = 'https://api.animeparadise.moe';
        this.config = {
            resolution: {
                label: 'Preferred Resolution',
                description: 'Try to download video in the selected resolution.\nIf the resolution is not supported, depending on the mirror the download may fail, or a fallback resolution may be used!',
                input: 'select',
                options: [
                    { value: '', name: 'Mirror\'s Default' },
                    { value: '360p', name: '360p' },
                    { value: '480p', name: '480p' },
                    { value: '720p', name: '720p' },
                    { value: '1080p', name: '1080p' }
                ],
                value: ''
            }
        };
    }
    async _getMangaFromURI(uri) {
        let request = new Request(uri, this.requestOptions);
        let data = await this._getNextData(request);
        let title = data.props.pageProps.data.title.trim();
        let id = data.props.pageProps.data.link;
        return new Manga(this, id, title);
    }
    async _getMangas() {
        //api and search are limited to 35 results no matter what i do, and they are not the same. Better not using them :/
        let msg = 'This website does not provide a manga list, please copy and paste the URL containing the chapters directly from your browser into HakuNeko.';
        throw new Error(msg);
    }
    async _getChapters(manga) {
        //first get anime id
        let uri = new URL('/anime/'+manga.id, this.url);
        let request = new Request(uri, this.requestOptions);
        let data = await this._getNextData(request);
        const mangaid = data.props.pageProps.data._id;
        //api request for episodes
        uri = new URL('/anime/'+mangaid+'/episode', this.api);
        request = new Request(uri, this.requestOptions);
        request.headers.set('x-origin', this.url);
        request.headers.set('x-referer', this.url);
        data = await this.fetchJSON(request);
        //
        return data.data.map(episode =>{
            return {
                id : '/watch/'+episode.uid+'?origin='+episode.origin,
                title : 'Episode '+ episode.number
            };
        }).reverse();
    }
    async _getPages(chapter) {
        let uri = new URL(chapter.id, this.url);
        let request = new Request(uri, this.requestOptions);
        let data = await this._getNextData(request);
        const subtitles = data.props.pageProps.subtitles.map(sub =>{
            return {
                url : sub.src,
                locale : sub.srclang
            };
        });
        const epnumber = data.props.pageProps.episode.number;
        const drive = data.props.pageProps.animeData.drive;
        const animename = data.props.pageProps.animeData.title;
        //buid api request to get links
        uri = new URL('/storage/'+animename+'/'+epnumber+'?&folderId='+ drive, this.api);
        request = new Request(uri, this.requestOptions);
        request.headers.set('x-origin', this.url);
        request.headers.set('x-referer', this.url);
        data = await this.fetchJSON(request);
        let streams = data.directUrl;
        let resolution = parseInt(this.config.resolution.value || 0);
        let stream = streams.find(stream => stream.resolution >= resolution) || streams.shift();
        return {
            video: new URL(stream.src, this.api).href,
            subtitles: subtitles
        };
    }
    async _getNextData(request) {
        const [data] = await this.fetchDOM(request, '#__NEXT_DATA__');
        return JSON.parse(data.textContent);
    }
}
