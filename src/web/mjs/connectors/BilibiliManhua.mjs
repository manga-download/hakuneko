import Connector from '../engine/Connector.mjs';
import Manga from '../engine/Manga.mjs';

export default class BilibiliManhua extends Connector {

    constructor() {
        super();
        super.id = 'neteasecomic';
        super.label = '哔哩哔哩 漫画 (Bilibili Manhua)';
        this.tags = [ 'manga', 'webtoon', 'chinese' ];
        this.url = 'https://manga.bilibili.com';
    }

    async _fetchTwirp(path, body) {
        const uri = new URL('/twirp/comic.v1.Comic' + path, this.url);
        uri.searchParams.set('device', 'pc');
        uri.searchParams.set('platform', 'web');
        const request = new Request(uri, {
            method: 'POST',
            body: JSON.stringify(body),
            headers: {
                'x-origin': this.url,
                'Content-Type': 'application/json;charset=UTF-8'
            }
        });
        const data = await this.fetchJSON(request);
        return data.data;
    }

    async _getMangaFromURI(uri) {
        const data = await this._fetchTwirp('/ComicDetail', {
            comic_id: parseInt(uri.pathname.match(/\/mc(\d+)/)[1])
        });
        return new Manga(this, data.id, data.title);
    }

    async _getMangas() {
        let mangaList = [];
        for(let page = 1, run = true; run; page++) {
            let mangas = await this._getMangasFromPage(page);
            mangas.length > 0 ? mangaList.push(...mangas) : run = false;
        }
        return mangaList;
    }

    async _getMangasFromPage(page) {
        const data = await this._fetchTwirp('/ClassPage', {
            style_id: -1,
            area_id: -1,
            is_free: -1,
            is_finish: -1,
            order: 0,
            page_size: 18,
            page_num: page
        });
        return data.map(entry => {
            return {
                id: entry.season_id,
                title: entry.title.trim()
            };
        });
    }

    async _getChapters(manga) {
        const data = await this._fetchTwirp('/ComicDetail', {
            comic_id: manga.id
        });
        return data.ep_list.filter(entry => entry.is_in_free || !entry.is_locked).map(entry => {
            return {
                id: entry.id,
                title: entry.short_title + ' - ' + entry.title,
                language: ''
            };
        });
    }

    async _getPages(chapter) {
        const data = await this._fetchTwirp('/GetImageIndex', {
            ep_id: chapter.id
        });
        const uri = new URL(data.path, data.host);
        let images = await this._getImageIndex(uri);
        //images = images.map(image => image + '@1100w.jpg');
        images = await this._fetchTwirp('/ImageToken', {
            urls: JSON.stringify(images)
        });
        return images.map(image => image.url + '?token=' + image.token);
    }

    async _getImageIndex(uri) {
        let request = new Request(uri);
        let response = await fetch(request);
        let encrypted = await response.arrayBuffer();
        let match = uri.pathname.match(/manga\/(\d+)\/(\d+)\/data/);
        let mangaID = parseInt(match[1]);
        let chapterID = parseInt(match[2]);

        let decrypted = this._decrypt(encrypted, mangaID, chapterID);
        let zip = await JSZip.loadAsync(decrypted, {});
        let index = await zip.file('index.dat').async('string');
        return JSON.parse(index).pics;
    }

    _decrypt(buffer, mangaID, chapterID) {
        let key = [
            chapterID & 0xff,
            chapterID >> 8 & 0xff,
            chapterID >> 16 & 0xff,
            chapterID >> 24 & 0xff,
            mangaID & 0xff,
            mangaID >> 8 & 0xff,
            mangaID >> 16 & 0xff,
            mangaID >> 24 & 0xff
        ];
        // create a view for the buffer
        let decrypted = new Uint8Array(buffer, 9);
        for(let index in decrypted) {
            decrypted[index] ^= key[index % key.length];
        }
        return decrypted;
    }
}