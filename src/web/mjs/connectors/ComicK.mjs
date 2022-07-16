import Connector from '../engine/Connector.mjs';
import Manga from '../engine/Manga.mjs';

export default class ComicK extends Connector {

    constructor() {
        super();
        super.id = 'comick';
        super.label = 'ComicK';
        this.tags = [ 'manga', 'english' ];
        this.url = 'https://comick.fun';
        this.apiurl = 'https://api.comick.fun';
    }

    async _getEmbeddedJSON(uri) {
        const request = new Request(uri, this.requestOptions);
        const scripts = await this.fetchDOM(request, 'script#__NEXT_DATA__');
        const data = JSON.parse(scripts[0].text);
        return data.props.pageProps;
    }

    async _getMangaFromURI(uri) {
        const data = await this._getEmbeddedJSON(uri);
        return new Manga(this, data.comic.slug, data.comic.title.trim());
    }

    async _getMangas() {
        let mangaList = [];
        for (let page = 1, run = true; run; page++) {
            const mangas = await this._getMangasFromPage(page);
            mangas.length > 0 ? mangaList.push(...mangas) : run = false;
        }
        return mangaList;
    }

    async _getMangasFromPage(page) {
        const uri = new URL('/search?page=' + page, this.apiurl);
        const request = new Request(uri, this.requestOptions);
        const data = await this.fetchJSONEx(request);
        return data.message ? [] : data.map(item => {
            return {
                id: item.slug,
                title: item.title.trim()
            };
        });
    }

    async _getChapters(manga) {
        let chapterList = [];
        const comicId = await this._getComicId(manga);
        for (let page = 1, run = true; run; page++) {
            const chapters = await this._getChaptersFromPage(comicId, page);
            chapters.length > 0 ? chapterList.push(...chapters) : run = false;
        }
        return chapterList;
    }

    async _getChaptersFromPage(comicId, page) {
        const uri = new URL(`/comic/${comicId}/chapter?page=${page}`, this.apiurl);
        const request = new Request(uri, this.requestOptions);
        const data = await this.fetchJSONEx(request);
        return data.chapters.map(item => {
            let title = '';
            if(item.vol) {
                title += `Vol. ${item.vol} `;
            }
            title += `Ch. ${item.chap}`;
            if(item.title) {
                title += ` - ${item.title}`;
            }
            title += ` (${item.lang})`;
            if(item.group_name && item.group_name.length) {
                title += ` [${item.group_name.join(', ')}]`;
            }
            return {
                id: item.hid,
                title: title,
                language: item.lang
            };
        });
    }

    async _getPages(chapter) {
        const uri = new URL('/chapter/' + chapter.id, this.apiurl);
        const request = new Request(uri, this.requestOptions);
        const data = await this.fetchJSONEx(request);
        return data.chapter.md_images.map(image => `https://meo.comick.pictures/${image.b2key}`);
    }

    async _getComicId(manga) {
        const uri = new URL('/comic/' + manga.id, this.apiurl);
        const request = new Request(uri, this.requestOptions);
        const data = await this.fetchJSONEx(request);
        return data.comic.id;
    }

    async fetchJSONEx(request, retries) {
        try {
            var data = await this.fetchJSON(request, retries);
            return data;
        } catch(error) {
            if(error.message.includes('status: 400')) {
                return { message: 'not found' };
            }
        }
    }
}