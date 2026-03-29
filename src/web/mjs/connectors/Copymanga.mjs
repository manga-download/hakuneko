import Connector from '../engine/Connector.mjs';
import Manga from '../engine/Manga.mjs';

function formatDate() {
    // Example: 2023.03.27
    return new Date().toISOString().replace(/-/g, ".").split('T').shift();
}

const API_HEADERS = {
    'User-Agent': '"User-Agent" to "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/102.0.5005.124 Safari/537.36 Edg/102.0.1245.44"',
    'version': formatDate(),
    "platform": "1",
};

export default class Copymanga extends Connector {

    constructor() {
        super();
        super.id = 'copymanga';
        super.label = '拷貝漫畫 (Copymanga)';
        this.tags = [ 'manga', 'webtoon', 'chinese' ];
        this.apiurl = 'https://api.copymanga.org';
        this.config = {
            url: {
                label: 'Website URL',
                description: 'This website may change their URL.\nThis is the last known URL which can also be manually set by the user.',
                input: 'text',
                value: 'https://www.copymanga.site',
            },
            format:  {
                label: 'Preferred format',
                description: 'format of images\nwebp \njpg',
                input: 'select',
                options: [
                    { value: 0, name: 'jpg' },
                    { value: 1, name: 'webp' },
                ],
                value: 0,
            },
            useGlobalCDN: {
                label: 'Use Global CDN',
                description: 'Requesting from the Global CDN',
                input: 'checkbox',
                value: true, // true for 0, false for 1
            }
        };
        this.requestOptions.headers.delete('accept');
        Object.keys(API_HEADERS).forEach(key => {
            this.requestOptions.headers.set(key, API_HEADERS[key]);
        });
        this.updateHeaders();
    }

    get url() {
        return this.config.url.value;
    }

    /**
     * Update request headers with real-time config values
     */
    updateHeaders() {
        this.requestOptions.headers.set("Referer", this.url);
        this.requestOptions.headers.set("webp", this.config.format.value);
        this.requestOptions.headers.set("region", this.config.useGlobalCDN.value ? 0 : 1);
    }

    async _getMangaFromURI(uri) {
        this.updateHeaders();
        const id = uri.pathname.split('/').pop();
        const apiUri = new URL('/api/v3/comic2/' + id, this.apiurl);
        const request = new Request(apiUri, this.requestOptions);
        const data = await this.fetchJSON(request);
        return new Manga(this, id, data.results.comic.name);
    }

    async _getMangas() {
        this.updateHeaders();
        let mangaList = [];
        const uri = new URL('/api/v3/comics', this.apiurl);
        const request = new Request(uri, this.requestOptions);
        const data = await this.fetchJSON(request);
        const pageCount = Math.ceil(data.results.total / 50);
        for(let page = 0; page < pageCount; page++) {
            const mangas = await this._getMangasFromPage(page);
            mangaList.push(...mangas);
        }
        return mangaList;
    }

    async _getMangasFromPage(page) {
        this.updateHeaders();
        const uri = new URL('/api/v3/comics?ordering=-datetime_updated&limit=50&offset=' + page * 50, this.apiurl);
        const request = new Request(uri, this.requestOptions);
        const data = await this.fetchJSON(request, 3);
        return data.results.list.map(element => {
            return {
                id: element.path_word,
                title: element.name
            };
        });
    }

    async _getChapters(manga) {
        this.updateHeaders();
        const uri = new URL(`/api/v3/comic/${manga.id}/group/default/chapters?limit=500`, this.apiurl);
        const request = new Request(uri, this.requestOptions);
        const data = await this.fetchJSON(request);
        if(data.results.total <= data.results.limit) {
            return data.results.list.map(item => {
                return {
                    id: item.uuid,
                    title: item.name
                };
            }).reverse();
        } else {
            let mangaList = [];
            const pageCount = Math.ceil(data.results.total / 500);
            for(let page = 0; page < pageCount; page++) {
                const mangas = await this._getChaptersFromPage(manga, page);
                mangaList.push(...mangas);
            }
            return mangaList.reverse();
        }
    }

    async _getChaptersFromPage(manga, page) {
        this.updateHeaders();
        const uri = new URL(`/api/v3/comic/${manga.id}/group/default/chapters?limit=500&offset=${page * 500}`, this.apiurl);
        const request = new Request(uri, this.requestOptions);
        const data = await this.fetchJSON(request);
        return data.results.list.map(item => {
            return {
                id: item.uuid,
                title: item.name
            };
        });
    }

    async _getPages(chapter) {
        this.updateHeaders();
        const uri = new URL(`/api/v3/comic/${chapter.manga.id}/chapter2/${chapter.id}?platform=3`, this.apiurl);
        const request = new Request(uri, this.requestOptions);
        const data = await this.fetchJSON(request);
        /**
         * Copymanga now messes up the order of images,
         * but in the API data, there's a chapter.words array that contains the correct page order.
         */
        const imageUrls = data.results.chapter.contents.map(item => item.url);
        const imageOrder = data.results.chapter.words;
        const orderedPages = [];
        imageOrder.forEach((order, index) => {
            orderedPages[order] = imageUrls[index];
        });
        return orderedPages;
    }
}