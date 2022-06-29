import Connector from '../engine/Connector.mjs';
import Manga from '../engine/Manga.mjs';

export default class Copymanga extends Connector {

    constructor() {
        super();
        super.id = 'copymanga';
        super.label = '拷貝漫畫 (Copymanga)';
        this.tags = [ 'manga', 'webtoon', 'chinese' ];
        this.url = 'https://copymanga.com';
        this.apiurl = 'https://api.copymanga.com';
        this.requestOptions.headers.delete('accept');
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
        const uri = new URL(`/api/v3/comic/${chapter.manga.id}/chapter/${chapter.id}`, this.apiurl);
        const request = new Request(uri, this.requestOptions);
        const data = await this.fetchJSON(request);
        return data.results.chapter.contents.map(item => item.url);
    }
}