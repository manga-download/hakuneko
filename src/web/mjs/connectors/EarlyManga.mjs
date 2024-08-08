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
        const uri = new URL('/api/search/advanced/post?page='+page, this.url);
        const body = {
            'list_order': 'desc'
        };
        const request = new Request(uri, {
            method: 'POST', body: JSON.stringify(body), headers: {
                'X-Requested-With': 'XMLHttpRequest',
                'Content-Type': 'application/json'
            }
        });

        const data = await this.fetchJSON(request);
        return data.data.map(item => {
            const id = { id: item.id, slug: item.slug };
            return {
                id : JSON.stringify(id),
                title : item.title.trim()
            };
        });
    }

    async _getChapters(manga) {
        const mangaid = JSON.parse(manga.id);
        const uri = new URL(`/api/manga/${mangaid.id}/${mangaid.slug}/chapterlist`, this.url);
        const request = new Request(uri, this.requestOptions);
        const data = await this.fetchJSON(request);
        return data.map(item => {
            const id = { id: item.id, slug: item.slug };
            return {
                id : JSON.stringify(id),
                title : 'Chapter ' + item.chapter_number
            };
        });
    }

    async _getPages(chapter) {
        const mangaid = JSON.parse(chapter.manga.id);
        const chapterid = JSON.parse(chapter.id);
        const uri = new URL(`/api/manga/${mangaid.id}/${mangaid.slug}/${chapterid.id}/chapter-${chapterid.slug}`, this.url);

        const request = new Request(uri, this.requestOptions);
        const data = await this.fetchJSON(request);
        return data.chapter.images.map(page => {
            const path = !data.chapter.on_disk ? 'https://images.earlym.org/manga' : '/storage/uploads/manga';
            return new URL(`${path}/manga_${data.chapter.manga_id}/chapter_${data.chapter.slug}/${page}`, this.url).href;
        });
    }

    async _getMangaFromURI(uri) {
        const mangaid = uri.href.match(/\/manga\/(\S+)/)[1];
        const apicallurl = new URL('/api/manga/'+mangaid, this.url);
        const request = new Request(apicallurl, this.requestOptions);
        const data = await this.fetchJSON(request);
        const id = { id: data.main_manga.id, slug: data.main_manga.slug };
        const title = data.main_manga.title.trim();
        return new Manga(this, JSON.stringify(id), title);
    }
}
