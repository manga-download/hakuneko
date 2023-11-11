import Connector from "../engine/Connector.mjs";
import Manga from "../engine/Manga.mjs";
import Chapter from "../engine/Chapter.mjs";

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

        this.booksApi = "https://api.ridibooks.com";
        this.pagesApi = "https://view.ridibooks.com";
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
            this.booksApi
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
                    this.booksApi
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
     * Method to get all pages of a webtoon.
     * @param {Chapter} chapter
     * @returns {Promise<(string[]|Object)>}
     * @override
     */
    async _getPages(chapter) {
        let uri = new URL(
            `/generate/${chapter.id}`,
            this.pagesApi
        );

        let request = new Request(uri, this.requestOptions);

        // TODO: authorization

        return this.fetchJSON(request, 3)
            .then(res => {
                if (!res.success) {
                    res.login_required && 
                        alert("Login required.");
                    return [];
                }

                return res.pages.map(page => page.src);
            });
    }

    /**
     * Get the manga from the provided resource.
     * @param {URL|string} uri
     * @returns {Promise<Manga>}
     * @override
     */
    async _getMangaFromURI(uri) {
        let request = new Request(uri, this.requestOptions);

        return Engine.Request.fetchUI(request, 'bookDetail').then(data => {
            let manga = new Manga(
                this,
                data.series_id,
                data.series_title
            );

            this._pushMangaToCache(manga);

            return manga;
        })
    }

    // -----------------------------

    async _pushMangaToCache(manga) {
        this.getMangas((_, mangas) => {
            this.isUpdating = true;

            mangas.push(manga);

            Engine.Storage.saveMangaList(this.id, mangas)
                .catch(err => {
                    console.error(err);
                })
                .finally(() => {
                    this.isUpdating = false;
                });
        });
    }

    async _clearCache() {
        this.isUpdating = true;
        Engine.Storage.saveMangaList(this.id, [])
            .catch(err => {
                console.error(err);
            })
            .finally(() => {
                this.isUpdating = false;
            });
    }
}