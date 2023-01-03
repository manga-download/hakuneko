import Connector from '../engine/Connector.mjs';
import Manga from '../engine/Manga.mjs';
export default class EarlyManga extends Connector {
    constructor() {
        super();
        super.id = 'earlymanga';
        super.label = 'EarlyManga';
        this.tags = [ 'webtoon', 'english' ];
        this.url = 'https://earlym.org';
    }
    async _getMangas() {
        let mangaList = [];
        for (let page = 0, run = true; run; page++) {
            const mangas = await this._getMangasFromPage(page);
            mangas.length > 0 ? mangaList.push(...mangas) : run = false;
        }
        return mangaList;
    }
    async _getMangasFromPage(page) {
        const uri = new URL('/api/search/advanced?page='+page, this.url);
        const request = new Request(uri, this.requestOptions);
        let data = await this.fetchJSON(request);
        return data.data.map(item => {
            return {
                id: '/manga/' + item.slug.trim(),
                title: item.title.trim()
            };
        });
    }
    async _getChapters(manga) {
        let chapterList = [];
        const mangaid = manga.id.match(/\/manga\/(\S+)/)[1];
        for(let page = 1, run = true; run; page++) {
            let chapters = await this._getChaptersFromPages(page, mangaid);
            chapters.length ? chapterList.push(...chapters) : run = false;
        }
        return chapterList;
    }
    async _getChaptersFromPages(page, mangaid) {
        const uri = new URL('/api/manga/'+mangaid+'/chapterlist?page='+page, this.url);
        const request = new Request(uri, this.requestOptions);
        let data = await this.fetchJSON(request);
        return data.data.map(item => {
            return {
                id: '/manga/' + mangaid + '/chapter-'+item.slug,
                title: 'Chapter '+item.chapter_number
            };
        });
    }
    async _getPages(chapter) {
        const uri = new URL('/api'+chapter.id, this.url);
        const request = new Request(uri, this.requestOptions);
        let data = await this.fetchJSON(request);
        let manga_id = data.chapter.manga_id;
        return data.chapter.images.map(item => {
            return this.url+'/storage/uploads/manga/manga_'+manga_id+'/chapter_'+data.chapter.slug+'/'+item;
        });
    }
    async _getMangaFromURI(uri) {
        const mangaid = uri.href.match(/\/manga\/(\S+)/)[1];
        const apicallurl = new URL('/api/manga/'+mangaid, this.url);
        const request = new Request(apicallurl, this.requestOptions);
        let data = await this.fetchJSON(request);
        const id = uri.pathname;
        const title = data.main_manga.title.trim();
        return new Manga(this, id, title);
    }
}
