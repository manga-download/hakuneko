import Connector from '../engine/Connector.mjs';
import Manga from '../engine/Manga.mjs';

export default class GuyaMoe extends Connector {

    constructor() {
        super();
        super.id = 'guya-moe';
        super.label = 'Guya.moe';
        this.tags = ['manga', 'english'];
        this.url = 'https://manga.guya.moe';
    }

    async _getMangas() {
        const request = new Request(this.url, this.requestOptions);
        /** @type {HTMLDivElement[]} */
        const [data] = await this.fetchDOM(request, '.dropdown-menu');
        const anchors = data.querySelectorAll('a');
        const result = [];
        anchors.forEach(a => {
            const href = this.getRootRelativeOrAbsoluteLink(a, this.url);
            if (!href.startsWith('/read/'))
                return;
            const urlParts = href.split('/');
            result.push({
                id: urlParts.pop() || urlParts.pop(),
                title: a.text.trim()
            });
        });
        return result;
    }

    /**
     * @param {{id: string, title: string}} manga
     */
    async _getChapters(manga) {
        const request = new Request(`${this.url}/api/series/${manga.id}`, this.requestOptions);
        const response = await fetch(request);
        /**@type {ApiResponse} */
        const data = await response.json();
        return Object.entries(data.chapters).sort((a, b) => b[0] - a[0]).map(entry => {
            const [chapterNum, chapter] = entry;
            return {
                id: chapterNum,
                title: `${chapterNum} - ${chapter.title}`,
            };
        });
    }

    /**
     *
     * @param {Chapter} chapter
     */
    async _getPages(chapter) {
        const request = new Request(`${this.url}/api/series/${chapter.manga.id}`, this.requestOptions);
        const response = await fetch(request);
        /**@type {ApiResponse} */
        const data = await response.json();
        const [pagesUrls, group] = getPagesInfo(data, chapter);
        const pages = pagesUrls.map(url => {
            return this.url + '/media/manga/' + chapter.manga.id + '/chapters/' + data.chapters[chapter.id].folder + '/' + group + '/' + url;
        });
        return pages;
    }

    /**
     *
     * @param {URL} uri
     */
    async _getMangaFromURI(uri) {
        const start = '/read/manga/';
        const index = uri.pathname.indexOf(start);
        let id = uri.pathname.substring(index + start.length);
        id = id.substring(0, id.indexOf('/'));
        const request = new Request(`${this.url}/api/series/${id}`, this.requestOptions);
        const response = await fetch(request);
        /**@type {ApiResponse} */
        const data = await response.json();
        const title = data.title;
        return new Manga(this, id, title);
    }

}

/**
 *
 * @param {ApiResponse} data
 * @param {Chapter} chapter
 */
function getPagesInfo(data, chapter) {
    const groups = data.chapters[chapter.id].groups;
    const preferredGroups = data.preferred_sort.reduce((obj, group, index) => {
        obj[group] = index;
        return obj;
    }, {});
    const preferred = [];
    const noPreference = [];
    Object.keys(groups).forEach(group => {
        const index = preferredGroups[group];
        if (index != undefined)
            preferred[index] = group;
        else
            noPreference.push(group);
    });
    const group = preferred.find(group => group != undefined) || noPreference.shift();
    return [groups[group], group];
}

/**
 * @typedef {{
 *  slug: string,
 *  title: string,
 *  description: string,
 *  author: string,
 *  artist: string,
 *  groups: Object.<string, string>,
 *  cover: string,
 *  preferred_sort: string[],
 *  chapters: Object.<string, ApiChapter>,
 *  next_release_page: boolean,
 *  next_release_time: number,
 *  next_release_html: string
 * }} ApiResponse
 *
 * @typedef {{
 *  volume: string,
 *  title: string,
 *  folder: string
 *  groups: Object.<string, string[]>
 *  release_date: Object.<string, number>
 * }} ApiChapter
 *
 * @typedef {{id: string, title: string, manga: {id: string, title: string}}} Chapter
 */