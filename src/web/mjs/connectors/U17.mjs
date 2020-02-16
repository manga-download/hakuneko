import Connector from '../engine/Connector.mjs';
import Manga from '../engine/Manga.mjs';

export default class U17 extends Connector {

    constructor() {
        super();
        super.id = 'useventeen';
        super.label = '有妖气 (U17)';
        this.tags = [ 'webtoon', 'chinese' ];
        this.url = 'http://www.u17.com';
    }

    async _getMangaFromURI(uri) {
        let request = new Request(uri, this.requestOptions);
        let data = await this.fetchDOM(request, 'div.comic_info div.left h1');
        let id = parseInt(uri.pathname.match(/\/(\d+)\.html$/)[1]);
        let title = data[0].textContent.trim();
        return new Manga(this, id, title);
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
        let uri = new URL('/comic/ajax.php', this.url);
        uri.searchParams.set('mod', 'comic_list');
        uri.searchParams.set('act', 'comic_list_new_fun');
        uri.searchParams.set('a', 'get_comic_list');
        let request = new Request(uri, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: new URLSearchParams({
                'data[group_id]': 'no',
                'data[theme_id]': 'no',
                'data[is_vip]': 'no',
                'data[accredit]': 'no',
                'data[color]': 'no',
                'data[comic_type]': 'no',
                'data[series_status]': 'no',
                //'data[order]': 2,
                'data[page_num]': page,
                'data[read_mode]': 'no'
            }).toString()
        });
        let data = await this.fetchJSON(request);
        return data.comic_list.map(item => {
            return {
                id: item.comic_id,
                title: item.name.trim()
            };
        });
    }

    async _getChapters(manga) {
        let uri = new URL('/comic/ajax.php', this.url);
        uri.searchParams.set('mod', 'comic');
        uri.searchParams.set('act', 'get_chapters');
        uri.searchParams.set('comic_id', manga.id);
        let request = new Request(uri, this.requestOptions);
        let data = await this.fetchJSON(request);
        return data.map(item => {
            return {
                id: item.chapter_id,
                title: item.chapter_name.trim(),
                language: ''
            };
        });
    }

    async _getPages(chapter) {
        let uri = new URL('/comic/ajax.php', this.url);
        uri.searchParams.set('mod', 'chapter');
        uri.searchParams.set('act', 'get_chapter_v5');
        uri.searchParams.set('chapter_id', chapter.id);
        let request = new Request(uri, this.requestOptions);
        let data = await this.fetchJSON(request);
        if(data.message) {
            throw new Error(data.message);
        }
        return data.image_list.map(image => this.getAbsolutePath(image.src, request.url));
    }
}