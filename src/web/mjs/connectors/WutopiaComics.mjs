import Connector from '../engine/Connector.mjs';
import Manga from '../engine/Manga.mjs';

export default class WutopiaComics extends Connector {

    constructor() {
        super();
        super.id = 'wutopiacomics';
        super.label = 'Wutopia';
        this.tags = [ 'webtoon', 'english' ];
        this.url = 'https://www.wutopiacomics.com';
    }

    async _fetchPOST(path, body) {
        let request = new Request(new URL(path, this.url), {
            method: 'POST',
            body: new URLSearchParams(body).toString(),
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'platform': '10'
            }
        });
        return this.fetchJSON(request);
    }

    async _getMangaFromURI(uri) {
        let id = parseInt(uri.hash.match(/\d+$/)[0]);
        let data = await this._fetchPOST('/mobile/cartoon-collection/get', {
            id: id
        });
        return new Manga(this, id, data.cartoon.name.trim());
    }

    async _getMangas() {
        let data = await this._fetchPOST('/mobile/cartoon-collection/search-fuzzy', {
            pageSize: 99999,
            pageNo: 1
        });
        return data.list.map(item => {
            return {
                id: item.id,
                title: item.name.trim()
            };
        });
    }

    async _getChapters(manga) {
        let data = await this._fetchPOST('/mobile/cartoon-collection/list-chapter', {
            id: manga.id,
            pageSize: 99999,
            pageNo: 1,
            sort: 0
        });
        return data.list.map(item => {
            return {
                id: item.id,
                //title: (item.chapterIndex + ' - ' + item.name).trim(),
                title: 'Chapter ' + item.chapterIndex,
                language: ''
            };
        });
    }

    async _getPages(chapter) {
        let data = await this._fetchPOST('/mobile/chapter/get', {
            id: chapter.id
        });
        return data.chapter.picList.map(item => item.picUrl.split('@')[0]);
    }
}