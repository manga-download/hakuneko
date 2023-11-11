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

        this.bookUrlPattern = /^https:\/\/ridibooks\.com\/books\/(?<id>[a-zA-Z0-9]+)/;
    }

    // OVERRIDE

    /**
     * Get all mangas from the website.
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

            // ⚠️ below is an assignment expression, not a comparisson
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
                title: item.title
            })));
    }

    /**
     * Method to get all pages of a chapter.
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
        if (!this.isBookPageURL(uri)) {
            alert("Not a valid URL.");
            return;
        }

        // first check if it already exists in cache
        let id = this.getIdFromUri(uri);

        let manga = this.findMangaById(id);

        if (manga) return manga;

        // else, try new request
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

    /** 
     * Helper function that checks if a given URI is a valid book page URL for the Ridibooks website.
     * @param {string|URL} uri - The URI from which to extract the ID.
     * @returns {boolean}
     */
    isBookPageURL(uri) {
        return this.bookUrlPattern.test(String(uri));
    }

    /**
     * Extracts the ID from a URI.
     * 
     * @param {string|URL} uri - The URI from which to extract the ID.
     * @returns {string|undefined} The extracted ID, or undefined if no match is found.
     */
    getIdFromUri(uri) {
        let match = String(uri).match(this.bookUrlPattern);
        
        if (match) return match.groups.id;
    }

    /**
     * Finds a manga by its ID.
     * 
     * This method loads the manga list from storage and searches for a manga with the specified ID.
     * If a matching manga is found, it is returned. Otherwise, undefined is returned.
     * 
     * @async
     * @param {string} id - The ID of the manga to find.
     * @returns {Promise<Manga|undefined>} A promise that resolves to the matching manga, or undefined if not found.
     */
    async findMangaById(id) {
        return Engine.Storage.loadMangaList(this.id)
            .then(mangas => mangas.find(manga => manga.id === id))
            .catch(() => undefined);
    }


    /**
     * Adds a manga to the existing manga list in the cache.
     * 
     * @param {Manga} manga - The manga to push to the cache.
     * @async
     */
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


    // async _clearCache() {
    //     this.isUpdating = true;
    //     Engine.Storage.saveMangaList(this.id, [])
    //         .catch(err => {
    //             console.error(err);
    //         })
    //         .finally(() => {
    //             this.isUpdating = false;
    //         });
    // }
}