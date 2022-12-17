import Connector from '../engine/Connector.mjs';
import Manga from '../engine/Manga.mjs';

export default class BilibiliManhua extends Connector {

    constructor() {
        super();
        super.id = 'neteasecomic';
        super.label = '哔哩哔哩 漫画 (Bilibili Manhua)';
        this.tags = [ 'manga', 'webtoon', 'chinese' ];
        this.url = 'https://manga.bilibili.com';
        this.lang = 'cn';

        this.config = {
            quality:  {
                label: 'Preferred format',
                description: 'format of images\nwebp (low)\njpg (medium)\npng (high))',
                input: 'select',
                options: [
                    { value: 'webp', name: 'webp' },
                    { value: 'jpg', name: 'jpg' },
                    { value: 'png', name: 'png' },
                ],
                value: 'png'
            }
        };
    }

    async _fetchTwirp(path, body) {
        const uri = new URL('/twirp/comic.v1.Comic' + path, this.url);
        uri.searchParams.set('device', 'pc');
        uri.searchParams.set('platform', 'web');
        uri.searchParams.set('lang', this.lang);
        uri.searchParams.set('sys_lang', this.lang);
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
        let images = data.images.map(image => image.path + '@' + image.x + 'w.' + this.config.quality.value);
        images = await this._fetchTwirp('/ImageToken', {
            urls: JSON.stringify(images)
        });
        return images.map(image => image.url + '?token=' + image.token);
    }
}
