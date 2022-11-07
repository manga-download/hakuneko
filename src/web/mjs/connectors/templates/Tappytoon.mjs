import Connector from '../../engine/Connector.mjs';
import Manga from '../../engine/Manga.mjs';

export default class Tappytoon extends Connector {
    constructor() {
        super();
        super.id = undefined;
        super.label = undefined;
        this.tags = [];
        this.url = undefined;
        this.baseURL = 'https://www.tappytoon.com';
        this.apiurl = 'https://api-global.tappytoon.com';

        this.lang = undefined;
        this.requestOptions.headers.set('x-referer', this.baseURL);
        this.requestOptions.headers.set('x-origin', this.baseURL);
    }

    get icon() {
        return '/img/connectors/tappytoon';
    }

    async _initializeConnector() {
        let uri = new URL(this.baseURL);
        let request = new Request(uri, this.requestOptions);
        let data = await this.fetchDOM(request, 'script#__NEXT_DATA__');
        let obj = JSON.parse(data[0].text).props.initialState.axios.headers;
        this.requestOptions.headers.set('Authorization', obj['Authorization']);
        this.requestOptions.headers.set('X-Device-Uuid', obj['X-Device-Uuid']);
    }

    async _getMangaFromURI(uri) {
        let request = new Request(uri, this.requestOptions);
        let data = await this.fetchDOM(request, 'script#__NEXT_DATA__');
        let obj = JSON.parse(data[0].text).props.initialProps.pageProps.comic;
        let id = obj.id;
        let title = obj.title;
        return new Manga(this, id, title);
    }

    async _getMangas() {
        let uri = new URL('/comics?locale=' + this.lang, this.apiurl);
        let request = new Request(uri, this.requestOptions);
        let data = await this.fetchJSON(request);
        return data.map(element => {
            return {
                id: element.id,
                title: element.title.replace(' [DE]', '').replace(' [FR]', '')
            };
        });
    }

    async _getChapters(manga) {
        let uri = new URL(`/comics/${manga.id}/chapters`, this.apiurl);
        let request = new Request(uri, this.requestOptions);
        let data = await this.fetchJSON(request);
        return data
            .filter(element => {
                return element.isAccessible && (element.isFree || element.isUserUnlocked || element.isUserRented);
            })
            .map(element => {
                return {
                    id: element.id,
                    title: element.title,
                    language: ''
                };
            }).reverse();
    }

    async _getPages(chapter) {
        let uri = new URL(`/chapters/${chapter.id}?includes=images`, this.apiurl);
        let request = new Request(uri, this.requestOptions);
        let data = await this.fetchJSON(request);
        return data.images.map(image => image.url);
    }
}