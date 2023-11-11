import Connector from "../engine/Connector.mjs";
import Manga from "../engine/Manga.mjs";

/**
 * @typedef {{
 *  id: string,
 *  title: string,
 * }} IManga
 * 
 * @typedef {{
 *  id: string,
 *  title: string,
 * }} IChapter
 */

export default class Ridibooks extends Connector {
    constructor() {
        super();

        this.id = 'ridibooks'
        this.label = 'Ridibooks (Korean)'
        this.tags = ['webtoon', 'korean'];
        this.url = 'https://ridibooks.com';
        this.links = {
            login: `${this.url}/account/login`
        }

        this.apiUrl = "https://api.ridibooks.com";
    }

    // OVERRIDE

    /**
     * Get all mangas from a website.
     * @returns {Promise<IManga[]>}
     * @override
     */
    async _getMangas() {
        let mangaList = [];

        let nextPage = new URL(
            "/v2/category/books",
            this.apiUrl
        );

        nextPage.search = new URLSearchParams({
            category_id: 1600,
            tab: "books",
            platform: "web",
            order_by: "popular",
            limit: 60,
            // start at first page
            offset: 0 
        }).toString();

        while(nextPage) {

            let request = new Request(
                nextPage,
                this.requestOptions
            );

            let { data } = await this.fetchJSON(request, 3);

            let pageMangaList = data.items.map(
                ({ book }) => ({
                    id: book.bookId,
                    title: book.title,
                })
            );

            mangaList.push(...pageMangaList);

            if (nextPage = data.pagination.nextPage) {
                nextPage = new URL(
                    nextPage,
                    this.apiUrl
                );
            }
        }

        return mangaList;
    }   

    /**
     * Method to get all chapters for a webtoon.
     * @param {IManga} manga
     * @returns {IChapter[]}
     * @override
     */
    async _getChapters(manga) {
        let uri = new URL(`/books/${manga.id}`, this.url);

        let request = new Request(uri, this.requestOptions);

        return Engine.Request.fetchUI(request, 'seriesBookListJson')
            .then(data => data.map(item => ({
                id: item.id,
                title: item.title,
                volume: item.volume
            })));
    }

    /**
     * @override
     */
    async _getPages(chapter) {}

    /**
     * @override
     */
    async _getMangaFromURI(uri) {}

    // -----------------------------
}