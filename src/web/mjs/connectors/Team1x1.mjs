import Connector from '../engine/Connector.mjs';
import Manga from '../engine/manga.mjs';

export default class Team1x1 extends Connector {

    constructor() {
        super();
        super.id = 'team1x1';
        super.label = 'Team X';
        this.tags = ['webtoon', 'arabic'];
        this.url = 'https://tqneplus.com';

    }

    async _getMangaFromURI(uri) {
        const request = new Request(uri, this.requestOptions);
        const data = await this.fetchDOM(request, 'div.row > div.col-md-9 > h3');
        const id = uri.pathname + uri.search;
        const title = data[0].textContent;
        return new Manga(this, id, title);
    }

    async _getMangaListFromPages(mangaPageLinks, index) {
        index = index || 0;
        const request = new Request(mangaPageLinks[index], this.requestOptions);
        const data = await this.fetchDOM(request, 'div#page-manga div.container div.last-post-manga div.thumb div.info h3 a', 5);
        let mangaList = data.map(element => {
            return {
                id: this.getRootRelativeOrAbsoluteLink(element, request.url),
                title: element.text.trim()
            };
        });
        if (index < mangaPageLinks.length - 1) {
            return this._getMangaListFromPages(mangaPageLinks, index + 1)
                .then(mangas => mangaList.concat(mangas));
        } else {
            return Promise.resolve(mangaList);
        }
    }

    async _getMangas() {
        const request = new Request(this.url + '/manga/', this.requestOptions);
        const data = await this.fetchDOM(request, 'div.pagination div.wp-pagenavi > a.last');
        const pageCount = parseInt(data[0].href.split("/").slice(-2, -1)[0].trim());
        const pageLinks = [... new Array(pageCount).keys()].map(page => request.url + 'page/' + (page + 1) + '/');
        return await this._getMangaListFromPages(pageLinks);
    }

    async _getChapters(manga) {
        let chapterList = [];
        const request = new Request(this.url + manga.id, this.requestOptions);
        const data = await this.fetchDOM(request, 'div.pagination span.current');
        const pageCount = parseInt(data[0].textContent.trim());
        for (let page = 1; page <= pageCount; page++) {
            let chapters = await this._getChaptersFromPage(page, manga);
            chapterList.push(...chapters);
        }
        return chapterList;
    }

    async _getChaptersFromPage(page, manga) {
        const request = new Request(this.url + manga.id + '/page/' + page, this.requestOptions);
        const data = await this.fetchDOM(request, 'div.single-manga-chapter div.container div.row div.col-md-12 a');
        return data
            .filter(element => element.href.startsWith(this.url))
            .map(element => {
                return {
                    id: this.getRootRelativeOrAbsoluteLink(element, request.url),
                    title: element.text.replace(manga.title, '').trim(),
                    language: ''
                };
            }).reverse();
    }

    async _getPages(chapter) {
        let request = new Request( this.url + chapter.id, this.requestOptions );
        let data = await this.fetchDOM(request, 'div[id^="translationPageall"] embed');
        return data.map(dat=> dat.src);
    }
}