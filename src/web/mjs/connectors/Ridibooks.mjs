import Connector from "../engine/Connector.mjs";
import Manga from "../engine/Manga.mjs";

/**
 * @typedef {{
 *  id: string,
 *  title: string,
 * }} IManga
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

        this.path = '/category/books/1600'
        this.paginationComponentSelector = "#__next > main > div > section > div:nth-child(6) > div > ul > li > a"
        this.mangaComponentSelector = "#__next > main > div > section > ul:nth-child(5) > li";

        // TODO: add request headers
    }

    // MANDATORY OVERRIDES

    /**
     * Get all mangas from a website.
     * @returns {Promise<IManga[]>}
     * @override
     */
    async _getMangas() {
        let mangaList = [];
        let currentPage = 0;
        // finalPage will be updated as we scrape pages
        let finalPage = 1;

        do {
            currentPage += 1;

            let uri = new URL(
                this.path, 
                this.url
            );

            uri.searchParams.set("page", currentPage);

            let request = new Request(
                uri, 
                this.requestOptions
            );

            let page = await this.fetchDOM(request);

            finalPage = this._updateFinalPage(page);

            let pageMangaList = 
                await this._getMangasFromPage(page);

            mangaList = [
                ...mangaList, 
                ...pageMangaList
            ];

        } while(currentPage < finalPage);
        
        return mangaList;
    }

    /**
     * @override
     */
    async _getChapters(manga) {}

    /**
     * @override
     */
    async _getPages(chapter) {}

    /**
     * @override
     */
    async _getMangaFromURI(uri) {}

    // HELPER METHODS

    async _updateFinalPage(page) {
        let availablePages = [
            ...page.querySelectorAll(
                this.paginationComponentSelector
            )
        ].map(item => parseInt(item.innerText));

        return Math.max(...availablePages);
    }

    async _getMangasFromPage(page) {
        let items = [
            ...page.querySelectorAll(
                this.mangaComponentSelector
            )
        ];

        return items.map(item => {
            let a = item.querySelector("a:not(:has(img))");

            let id = a.getAttribute("href")
                .match(/^\/books\/(?<id>\d+)\?/)
                ?.groups?.id;

            let title = a.innerText.trim();

            return { id, title };
        });
    }
}