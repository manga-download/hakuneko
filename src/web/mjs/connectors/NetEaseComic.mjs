import Connector from '../engine/Connector.mjs';
import Manga from '../engine/Manga.mjs';

export default class NetEaseComic extends Connector {

    constructor() {
        super();
        super.id = 'neteasecomic';
        super.label = '哔哩哔哩 漫画 (bilibili Comics)';
        this.tags = [ 'manga', 'webtoon', 'chinese' ];
        this.url = 'https://manga.bilibili.com';
    }

    async _getMangaFromURI(uri) {
        let request = new Request(new URL('/twirp/comic.v2.Comic/ComicDetail?device=pc&platform=web', this.url), {
            method: 'POST',
            body: JSON.stringify({
                comic_id: parseInt(uri.pathname.match(/\/mc(\d+)/)[1])
            }),
            headers: {
                'x-origin': this.url,
                'Content-Type': 'application/json;charset=UTF-8'
            }
        });
        let data = await this.fetchJSON(request);
        return new Manga(this, data.data.id, data.data.title);
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
        let uri = new URL('/twirp/comic.v1.Comic/ClassPage', this.url);
        uri.searchParams.set('device', 'pc');
        uri.searchParams.set('platform', 'web');
        let request = new Request(uri, {
            method: 'POST',
            body: JSON.stringify({
                style_id: -1,
                area_id: -1,
                is_free: -1,
                is_finish: -1,
                order: 0,
                page_size: 18,
                page_num: page
            }),
            headers: {
                'x-origin': this.url,
                'Content-Type': 'application/json;charset=UTF-8'
            }
        });
        let data = await this.fetchJSON(request);
        return data.data.map(entry => {
            return {
                id: entry.season_id,
                title: entry.title.trim()
            };
        });
    }

    async _getChapters(manga) {
        let uri = new URL('/twirp/comic.v2.Comic/ComicDetail', this.url);
        uri.searchParams.set('device', 'pc');
        uri.searchParams.set('platform', 'web');
        let request = new Request(uri, {
            method: 'POST',
            body: JSON.stringify({
                comic_id: manga.id
            }),
            headers: {
                'x-origin': this.url,
                'Content-Type': 'application/json;charset=UTF-8'
            }
        });
        let data = await this.fetchJSON(request);
        return data.data.ep_list.filter(entry => entry.is_in_free || !entry.is_locked).map(entry => {
            return {
                id: entry.id,
                title: entry.short_title + ' - ' + entry.title,
                language: ''
            };
        });
    }

    async _getPages(chapter) {
        let uri = new URL('/twirp/comic.v1.Comic/GetImageIndex', this.url);
        uri.searchParams.set('device', 'pc');
        uri.searchParams.set('platform', 'web');
        let request = new Request(uri, {
            method: 'POST',
            body: JSON.stringify({
                ep_id: chapter.id
            }),
            headers: {
                'x-origin': this.url,
                'Content-Type': 'application/json;charset=UTF-8'
            }
        });
        let data = await this.fetchJSON(request);

        uri = new URL(data.data.path, data.data.host);
        let images = await this._getImageIndex(uri);
        //images = images.map(image => image + '@1100w.jpg');

        uri = new URL('/twirp/comic.v1.Comic/ImageToken', this.url);
        uri.searchParams.set('device', 'pc');
        uri.searchParams.set('platform', 'web');
        request = new Request(uri, {
            method: 'POST',
            body: JSON.stringify({
                urls: JSON.stringify(images)
            }),
            headers: {
                'x-origin': this.url,
                'Content-Type': 'application/json;charset=UTF-8'
            }
        });
        data = await this.fetchJSON(request);

        return data.data.map(image => image.url + '?token=' + image.token);
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