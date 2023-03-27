import Connector from '../engine/Connector.mjs';
import Manga from '../engine/Manga.mjs';

function formatDate() {
    // Example: 2023.03.27
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1;
    const day = now.getDate();
    return `${year}.${month < 10 ? "0" : ""}${month}.${day}`;
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
        this.config = {
            url: {
                label: 'Website URL',
                description: 'This website may change their URL.\nThis is the last known URL which can also be manually set by the user.',
                input: 'text',
                value: 'https://www.copymanga.site'
            },
            apiurl: {
                label: 'API URL',
                description: 'This website may change their API URL.\nThis is the last known API URL which can also be manually set by the user.',
                input: 'text',
                value: 'https://api.copymanga.org'
            },
            format:  {
                label: 'Preferred format',
                description: 'format of images\nwebp \njpg',
                input: 'select',
                options: [
                    { value: 'webp', name: 'webp' },
                    { value: 'jpg', name: 'jpg' },
                ],
                value: 'webp'
            },
            useOverseaCDN: {
                label: 'Use Oversea CDN',
                description: 'Requesting from the Oversea CDN',
                input: 'select',
                options: [
                    { value: 'yes', name: 'Yes' },
                    { value: 'no', name: 'No' },
                ],
                value: 'yes'
            }
        };
        this.requestOptions.headers.delete('accept');
        Object.keys(API_HEADERS).forEach(key => {
            this.requestOptions.headers.append(key, API_HEADERS[key]);
        });
        this.requestOptions.headers.append("Referer", this.url);
        this.requestOptions.headers.append("webp", this.format === "webp" ? 1 : 0);
        this.requestOptions.headers.append("region", this.useOverseaCDN === "yes" ? 0 : 1);
    }

    get url() {
        return this.config.url.value;
    }

    set url(value) {
        if (this.config && value) {
            this.config.url.value = value;
            Engine.Settings.save();
        }
    }

    get apiurl() {
        return this.config.apiurl.value;
    }

    set apiurl(value) {
        if (this.config && value) {
            this.config.apiurl.value = value;
            Engine.Settings.save();
        }
    }

    get format() {
        return this.config.format.value;
    }

    set format(value) {
        if (this.config && value) {
            this.config.format.value = value;
            Engine.Settings.save();
        }
    }

    get useOverseaCDN() {
        return this.config.useOverseaCDN.value;
    }

    set useOverseaCDN(value) {
        if (this.config && value) {
            this.config.useOverseaCDN.value = value;
            Engine.Settings.save();
        }
    }

    canHandleURI(uri) {
        return /copymanga/.test(uri.origin);
    }

    async _getMangaFromURI(uri) {
        const id = uri.pathname.split('/').pop();
        const apiUri = new URL('/api/v3/comic2/' + id, this.apiurl);
        const request = new Request(apiUri, this.requestOptions);
        const data = await this.fetchJSON(request);
        return new Manga(this, id, data.results.comic.name);
    }

    async _getMangas() {
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
        const uri = new URL(`/api/v3/comic/${chapter.manga.id}/chapter2/${chapter.id}?platform=3`, this.apiurl);
        const request = new Request(uri, this.requestOptions);
        const data = await this.fetchJSON(request);
        return data.results.chapter.contents.map(item => item.url);
    }
}