import Connector from '../engine/Connector.mjs';
import Manga from '../engine/Manga.mjs';

export default class MangaNel extends Connector {

    constructor() {
        super();
        super.id = 'manganel';
        super.label = 'Manganato';
        this.tags = [ 'manga', 'webtoon', 'english' ];
        this.url = 'https://www.manganato.gg';

        this.path = '/genre/all';
        this.mangaTitleFilter = /(\s+manga|\s+webtoon|\s+others)+\s*$/gi;
        this.chapterTitleFilter = /^\s*(\s+manga|\s+webtoon|\s+others)+/gi;
        this.queryMangaTitle = 'div.manga-info-top h1';
        this.queryMangas = 'div.list-comic-item-wrap h3 a';

        this._queryChapters = 'div.chapter-list div.row span a'; // mangabat, manganato, mangakakalot
        this._queryPages = 'div.container-chapter-reader source'; // manganato, mangabat, mangakakalot
    }

    async _getMangaFromURI(uri) {
        const request = new Request(uri, this.requestOptions);
        const data = await this.fetchDOM(request, this.queryMangaTitle);
        const title = data[0].textContent.replace(this.mangaTitleFilter, '').trim();
        return new Manga(this, uri.pathname, title);
    }

    async _getMangas() {
        const mangaList = [];
        for (let page = 1, run = true; run; page++) {
            /**
             * To stop the 429 error (too many requests), we will wait 5 seconds before each page request.
             * Any wait time shorter than 5 seconds will eventually lead to a 429 error (too many requests).
             * THIS WILL TAKE A LONG TIME TO RUN & TO TRY GETTING ALL THE MANGAS
             * As of February 12, 2026 (2/12/2026), there are around 74,000 mangas. A maximum of 24 mangas
             * per page, and there are 3076 pages.
             */
            await this.wait(5000);
            const mangas = await this._getMangasFromPage(page);
            mangas.length > 0 ? mangaList.push(...mangas) : run = false;
        }
        return mangaList;
    }

    async _getMangasFromPage(page) {
        const uri = new URL(this.path + "?page=" + page, this.url);
        const request = new Request(uri, this.requestOptions);
        const data = await this.fetchDOM(request, this.queryMangas);
        return data.map(element => {
            return {
                id: this.getRootRelativeOrAbsoluteLink(element, request.url),
                title: element.text.trim()
            };
        });
    }

    // //ORIGINAL
    // async _getChapters(manga) {
    //     const uri = new URL(manga.id, this.url);
    //     console.log("URI ------------> ", uri);   //DEBUGGING
    //     console.log("Fetching chapters from URI:", uri.href);
    //     const request = new Request(uri, this.requestOptions);
    //     console.log("REQUEST ------------> ", request);   //DEBUGGING

    //     const data = await this.fetchDOM(request, this._queryChapters);
    //     console.log("DATA fetched for chapters ------------> ", data);   //DEBUGGING
    //     // Log details of each element
    //     data.forEach((el, index) => {
    //         console.log(`Chapter element ${index}:`, el);
    //     });
    //     return data.map(element => {
    //         return {
    //             id: this.getRootRelativeOrAbsoluteLink(element, request.url),
    //             title: element.text.replace(manga.title, '').replace(this.chapterTitleFilter, '').trim(),
    //             language: ''
    //         };
    //     });
    // }

    /**
     * Version 2 using manganato API URL and the manga chapters keys/values
     * The general API is not available, but we can get the info of the specific
     * mangas we need following this format:
     *      https://www.manganato.gg/api${manga.id}/chapters
     * For example:
     *      https://www.manganato.gg/api/manga/i-used-high-level-medicine-to-counter-magic/chapters
     * Note that ${manga.id} starts with "/manga":
     *      /manga/i-used-high-level-medicine-to-counter-magic
     */
    async _getChapters(manga) {
        const apiUrl = `https://www.manganato.gg/api${manga.id}/chapters`;
        const response = await this.fetchJSON(apiUrl);
        if (!response.success) return [];
        const chapters = response.data.chapters;

        return chapters.map(chapter => {
            //Building the chapter URL (i.e., https://www.manganato.gg/manga/i-used-high-level-medicine-to-counter-magic/chapter-1)
            const chapterUrl = `${this.url}${manga.id}/${chapter.chapter_slug}`;
            return {
                id: chapterUrl,
                title: chapter.chapter_name, //"chapter_name": "Chapter 1",
                chapterSlug: chapter.chapter_slug, //"chapter_slug": "chapter-1",
                chapterNum: chapter.chapter_num, //"chapter_num": 1,
            };
        });
    }

    async _getPages(chapter) {
        const uri = new URL(chapter.id, this.url);
        const request = new Request(uri, this.requestOptions);
        const data = await this.fetchDOM(request, this._queryPages);
        return data.map(element => this.createConnectorURI({
            url: this.getRootRelativeOrAbsoluteLink(element.dataset['src'] || element, request.url),
            referer: request.url
        }));
    }

    async _handleConnectorURI(payload) {
        /*
         * TODO: only perform requests when from download manager
         * or when from browser for preview and selected chapter matches
         */
        this.requestOptions.headers.set('x-referer', new URL(this.url).href);
        let promise = super._handleConnectorURI(payload.url);
        this.requestOptions.headers.delete('x-referer');
        return promise;
    }
}
