import Connector from "../engine/Connector.mjs";
import Manga from "../engine/Manga.mjs";

export default class Ridibooks extends Connector {
    constructor() {
        super();
        this.id = 'ridibooks';
        this.label = 'Ridibooks (Korean)';
        this.tags = ['webtoon', 'korean'];
        this.url = 'https://ridibooks.com';
        this.links = {
            login: `${this.url}/account/login`
        };
        this.apiUrl = "https://api.ridibooks.com";
    }

    async _getMangas() {
        const mangaList = [];
        let uri = new URL("/v2/category/books", this.apiUrl);
        uri.search = new URLSearchParams({
            category_id: 1600,
            tab: "books",
            platform: "web",
            order_by: "popular",
            limit: 60,
            offset: 0
        }).toString();
        while(uri) {
            const request = new Request(uri, this.requestOptions);
            const { data } = await this.fetchJSON(request);
            const pageMangaList = data.items.map(({ book }) => ({ id: book.bookId, title: book.title }));
            mangaList.push(...pageMangaList);
            uri = data.pagination.nextPage && new URL(data.pagination.nextPage, this.apiUrl);
        }
        return mangaList;
    }

    async _getChapters(manga) {
        const uri = new URL(`/books/${manga.id}`, this.url);
        const request = new Request(uri, this.requestOptions);
        return Engine.Request.fetchUI(request, 'seriesBookListJson');
    }

    async _getPages(chapter) {
        const uri = new URL('/api/web-viewer/generate', this.url);
        const data = await this.fetchJSON(new Request(uri.href, {
            method: 'POST',
            body: JSON.stringify({
                book_id: chapter.id
            }),
            headers: {
                'Content-Type': 'application/json',
            },
        }));
        return data.success ? data.data.pages.map(page =>page.src) : [];
    }

    async _getMangaFromURI(uri) {
        const request = new Request(uri, this.requestOptions);
        const data = await Engine.Request.fetchUI(request, "bookDetail");
        return new Manga(this, data.series_id, data.series_title);
    }
}
