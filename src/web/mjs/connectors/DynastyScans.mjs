import Connector from '../engine/Connector.mjs';
import Manga from '../engine/Manga.mjs';

/**
 * @author Neogeek
 */
export default class DynastyScans extends Connector {

    constructor() {
        super();
        // Public members for usage in UI (mandatory)
        super.id = 'dynasty-scans';
        super.label = 'DynastyScans';
        this.tags = [ 'manga', 'english' ];
        // Private members for internal usage only (convenience)
        this.url = 'https://dynasty-scans.com';
    }

    async _getMangaFromURI(uri) {
        const request = new Request(uri, this.requestOptions);
        const data = await this.fetchDOM(request, 'div#main h2.tag-title > b');
        const id = uri.pathname;
        const title = data[0].textContent.trim();
        return new Manga(this, id, title);
    }

    async _getMangas() {
        let mangaList = [];
        const mangaTypes = [ 'series', 'anthologies', 'issues', 'doujins' ];
        for (let type of mangaTypes) {
            const mangas = await this._getMangasFromPages(type);
            mangaList.push(...mangas);
        }
        return mangaList;
    }

    async _getMangasFromPages(type) {
        let mangaListFromPages = [];
        for (let page = 1, run = true; run; page++) {
            const json = await this.fetchJSON(`${this.url}/${type}.json?page=${page}`);
            let mangas = [];
            for (let letter in json.tags) {
                mangas.push( ...json.tags[letter][Object.keys(json.tags[letter])[0]].map( manga => {
                    return {
                        id: `${type}/${manga.permalink}`,
                        title: manga.name.trim()
                    };
                }));
            }
            mangaListFromPages.push(...mangas);
            run = page !== json.total_pages;
        }
        return mangaListFromPages;
    }

    async _getChapters(manga) {
        const json = await this.fetchJSON( new URL(`${manga.id}.json`, this.url).href );
        // filter removes the "header" elements from the list
        let chapterList = json['taggings'].filter( chapter => !('header' in chapter) ).map( chapter => {
            return {
                id: `/chapters/${chapter.permalink}`,
                title: chapter.title.trim(),
                language: ''
            };
        } );
        // rename duplicate chapters, using a stack to count preceding chapters with the same name
        let titleStack = [];
        for( let chapter of chapterList ) {
            // do not change the command order!
            let duplicateCount = titleStack.filter( t => t === chapter.title ).length;
            titleStack.push( chapter.title );
            chapter.title += duplicateCount > 0 ? ` #${duplicateCount}` : '';
        }
        return chapterList;
    }

    async _getPages(chapter) {
        let json = await this.fetchJSON( new URL(`${chapter.id}.json`, this.url).href );
        const pageList = json['pages'].map( page => this.url + page.url );
        return pageList;
    }
}