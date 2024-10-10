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
        let {props : {pageProps: {episode }}} = await this._getNextData(request);

        const subtitles = episode.subData.map(sub =>{
            let src = sub.src;
            try {
                src = new URL(src).href;
            } catch (e) {
                //compose url with website api
                src = new URL(`/stream/file/${src}`, this.api).href;
            }
            return {
                url : src,
                locale : sub.label
            };
        });

        return {
            hash: 'id,language,resolution',
            mirrors: [ episode.streamLink ],
            subtitles
        };

    }
    async _getNextData(request) {
        const [data] = await this.fetchDOM(request, '#__NEXT_DATA__');
        return JSON.parse(data.textContent);
    }
}
