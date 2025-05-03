import SpeedBinb from "./templates/SpeedBinb.mjs";
import Manga from '../engine/Manga.mjs';

export default class MangaPlaza extends SpeedBinb {

    constructor() {
        super();
        super.id = 'mangaplaza';
        super.label = 'MangaPlaza';
        this.tags = ['manga', 'english'];
        this.url = 'https://mangaplaza.com';
        this.baseURL = 'https://reader.mangaplaza.com/speedreader';
        this.links = {
            login: 'https://mangaplaza.com/login'
        };
        this.apiURL = new URL('/api/', this.url);
        this.requestOptions.headers.set('x-cookie', 'mp_over18_agreement=ON');
        this.pageNoSelector = '.pages>:nth-last-child(2)>a';
    }

    async _getMangaFromURI(uri) {
        const results = await this.fetchDOM(new Request(uri, this.requestOptions), '#_title_nm');
        const id = uri.pathname.split('/')[2];
        const title = results[0].innerText.replace(/^<.*>/, '').trim();
        return new Manga(this, id, title);
    }

    async _getMangas() {
        // Do not retrieve light novels
        const genres = await this.fetchDOM(new Request(new URL('/genre', this.url), this.requestOptions), 'details:not(:last-child) li:first-child>a');
        const mangaList = Array.from(new Set());
        for (const genre of genres) {
            mangaList.push(...await this._getMangasFromGenre(genre.pathname));
        }

        return mangaList;
    }

    async _getMangasFromGenre(path) {
        const results = await this.fetchDOM(new Request(new URL(path, this.url), this.requestOptions), this.pageNoSelector);
        const pageCount = results.length != 0 ? parseInt(results[0].text) : 1;

        const mangaList = [];
        for (let page = 1; page <= pageCount; page++) {
            const results = await this.fetchDOM(new Request(new URL(`${path}?page=${page}`, this.url), this.requestOptions), 'ul.listBox li div.titleName a');

            mangaList.push(
                ...results.map(e => {
                    return {
                        id: e.pathname.split('/')[2],
                        title: e.innerText.replace(/^<.*>/, '').trim()
                    };
                })
            );
        }

        return mangaList;
    }

    async _getChapters(manga) {
        const chapterList = [];
        const uri = new URL(`title/content_list/?title_id=${manga.id}`, this.apiURL);

        const { data: { html_page}} = await this.fetchJSON(uri, this.requestOptions);
        const doc = new DOMParser().parseFromString(html_page, 'text/html');
        const pageBtn = doc.querySelector(this.pageNoSelector);

        const pageCount = pageBtn ? parseInt(pageBtn.text) : 1;
        for (let page = 1; page <= pageCount; page++) {
            chapterList.push(...await this._getChaptersFromPage(uri, page, manga.id));
        }

        return chapterList;
    }

    async _getChaptersFromPage(uri, page, mangaId) {
        const { data: { html_content}} = await this.fetchJSON(new Request(new URL(`${uri}&page=${page}`), this.requestOptions));
        const doc = new DOMParser().parseFromString(html_content, 'text/html');
        return [...doc.querySelectorAll('.inner_table')]
            .filter(e => e.querySelector('a[href*="/reader/"]'))
            .map(e => {
                const btn = e.querySelector('a[href*="/reader/"]');
                const contentId = btn.pathname.split('/')[2];

                let title = e.querySelector('.titleName').innerText.trim();
                let u0 = 0;
                if (btn.pathname.includes('/preview/')) {
                    title += ' (Preview)';
                    u0 = 1;
                }

                return {
                    id: `?cid=${contentId}&u0=${u0}&u1=https%3A%2F%2Fmangaplaza.com%2Ftitle%2F${mangaId}%2F%3Forder%3Dup%26content_id%3D${contentId}`,
                    title: title,
                };
            });
    }
}
