import MH from './templates/MH.mjs';

export default class mkzhan extends MH {

    constructor() {
        super();
        super.id = 'mkzhan';
        super.label = 'mkzhan';
        this.tags = [ 'manga', 'webtoon', 'chinese' ];
        this.url = 'https://www.mkzhan.com';

        this.path = '/category/?page=%PAGE%';
        this.queryMangasPageCount = 'div#Pagination a:nth-last-child(2)';
        this.queryMangas = 'div.cate-comic-list div.common-comic-item a.cover';
        this.queryMangaTitle = 'div.de-info__box p.comic-title ';
        this.apiUrl = 'https://comic.mkzcdn.com';
    }

    async _getChapters(manga) {
        const mangaId = manga.id.match(/\/(\d+)\/$/)[1];
        const request = new Request(new URL(`/chapter/v1/?comic_id=${mangaId}`, this.apiUrl), this.requestOptions);
        const data = await this.fetchJSON(request);
        return data.code == 200 ? data.data.map(element => {
            return {
                id: element.chapter_id,
                title: element.title.trim()
            };
        }) : [];
    }

    async _getPages(chapter) {
        const mangaId = chapter.manga.id.match(/\/(\d+)\/$/)[1];
        const request = new Request(new URL(`/chapter/content/v1/?chapter_id=${chapter.id}&comic_id=${mangaId}&format=1&quality=1&type=1`, this.apiUrl), this.requestOptions);
        const data = await this.fetchJSON(request);
        return data.code == 200 ? data.data.page.map(element => element.image) : [];

    }

}
