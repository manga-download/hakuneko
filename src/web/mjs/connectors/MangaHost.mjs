import Connector from '../engine/Connector.mjs';
import Manga from '../engine/Manga.mjs';

export default class MangaHost extends Connector {

    constructor() {
        super();
        super.id = 'mangahost';
        super.label = 'MangaHost';
        this.tags = ['manga', 'portuguese'];
        this.url = 'https://mangahostz.com';

        this.config = {
            mangaListThrottle: {
                label: 'Throttle Requests [ms]',
                description: 'Enter the timespan in [ms] to delay consecuitive HTTP requests.\nThe website may reject to many consecuitive requests.\nSlightly increase the value when getting 403 errors during manga list update.',
                input: 'numeric',
                min: 0,
                max: 5000,
                value: 1000
            }
        };
    }

    canHandleURI(uri) {
        return /https?:\/\/(mangahost(ed|z|2|4)\.com|mangahost\.(net|site))/.test(uri.origin);
    }

    async _initializeConnector() {
        let uri = new URL(this.url);
        let request = new Request(uri.href, this.requestOptions);
        this.url = await Engine.Request.fetchUI(request, `window.location.origin`);
        console.log(`Assigned URL '${this.url}' to ${this.label}`);
    }

    async _getMangaFromURI(uri) {
        const request = new Request(uri, this.requestOptions);
        const data = await this.fetchDOM(request, '.title');
        return new Manga(this, uri.pathname, data[0].textContent.trim());
    }

    async _getMangas() {
        const pageData = await this.fetchDOM(this.url + '/mangas', 'div.paginador div.wp-pagenavi a.last');
        let pageCount = parseInt(pageData[0].href.match(/(\d+)$/)[1]);
        let mangaList = [];
        for (let page = 1; page <= pageCount; page++) {
            const data = await this.fetchDOM(this.url + '/mangas/page/' + page, 'a.manga-block-title-link', 5);
            const pageList = data.map(element => {
                return {
                    id: this.getRootRelativeOrAbsoluteLink(element, this.url),
                    title: element.text.trim()
                };
            });
            await this.wait(this.config.mangaListThrottle.value);
            mangaList.push(...pageList);
        }
        return mangaList;
    }

    async _getChapters(manga) {
        const url = new URL(manga.id, this.url);
        url.searchParams.set('t', Date.now());
        const data = await this.fetchDOM(url.href, 'div.chapters div.card.pop div.pop-title span');
        return data.map(element => {
            return {
                id: [manga.id, element.textContent].join('/'),
                title: element.textContent,
                language: 'pt'
            };
        });
    }

    async _getPages(chapter) {
        let request = new Request(chapter.id, this.requestOptions);
        return await this.fetchRegex(request, /<img\s+id='img_\d+'\s+src='(.*?)'/g);
    }
}
