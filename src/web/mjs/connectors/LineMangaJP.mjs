import Connector from '../engine/Connector.mjs';
import Manga from '../engine/Manga.mjs';

export default class LineMangaJP extends Connector {

    constructor() {
        super();
        super.id = 'line_manga_jp';
        super.label = 'Line Manga (LINEマンガ)';
        this.tags = ['webtoon', 'japanese'];
        this.url = 'https://manga.line.me';
    }

    async _getMangaFromURI(uri) {
        const id = uri.searchParams.get('id');
        const request = new Request(uri, this.requestOptions);
        const data = await this.fetchDOM(request, 'h1');
        const title = data[1].textContent.trim();
        return new Manga(this, id, title);
    }

    async _getMangas() {
        let hasNext = true;
        let page = 1;
        let mangas = [];
        while (hasNext) {
            const request = new Request(`${this.url}/api/search_product/magazine_list?magazine_id=Z0000001&is_periodic=0&is_original=0&page=${page}`, this.requestOptions);
            const response = await this.fetchJSON(request);
            mangas.push(...response.result.rows);
            hasNext = response.result.pager.hasNext;
            page += 1;
        }
        return mangas.map(row => {
            return {
                id: row.id,
                title: row.name
            };
        });
    }

    async _getChapters(manga) {
        const res = await this.fetchJSON(`${this.url}/api/book/product_list?need_read_info=1&rows=1000&is_periodic=1&product_id=${manga.id}`);
        const rows = res.result.rows;
        return rows.map(row => {
            return {
                id: row.id,
                title: row.name
            };
        });
    }

    async _getPages(chapter) {
        const request = new Request(`${this.url}/book/viewer?id=${chapter.id}`, this.requestOptions);
        const imgs = await Engine.Request.fetchUI(request, 'window.imgs || {}');
        if (Object.keys(imgs).length == 0) {
            throw new Error(`The chapter '${chapter.title}' is neither public, nor purchased!`);
        }
        return Object.values(imgs)
            .map(img => img.url)
            .filter(url => !url.includes('inline_ads_banner'));
    }
}