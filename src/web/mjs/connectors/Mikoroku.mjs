import Connector from '../engine/Connector.mjs';
import Manga from '../engine/Manga.mjs';
export default class Mikoroku extends Connector {
    constructor() {
        super();
        super.id = 'mikoroku';
        super.label = 'Mikoroku';
        this.tags = [ 'manga', 'scanlation', 'indonesian' ];
        this.url = 'https://www.mikoroku.web.id';
        this.queryMangaTitle = 'header > h1';
    }

    async _getMangas() {
        let mangalist = [];
        const request = new Request(new URL('/feeds/posts/default/-/Series?orderby=published&alt=json&max-results=999', this.url), this.requestOptions);
        const { feed } = await this.fetchJSON(request);
        feed.entry.map(manga => {
            const goodLink = manga.link.find(link => link.rel === 'alternate');
            mangalist.push({
                id: this.getRootRelativeOrAbsoluteLink(goodLink.href, request.url),
                title: goodLink.title.trim()
            });
        });
        return mangalist;
    }

    async _getChapters(manga) {
        let uri = new URL(manga.id, this.url);
        let request = new Request(uri, this.requestOptions);
        let dom = (await this.fetchDOM(request, 'body'))[0];
        let data = [...dom.querySelectorAll('script')];

        const clwdrun = data.filter(el => el.text.trim().startsWith('clwd.run'));
        let mangaid= '';
        if (clwdrun.length > 0) {
            mangaid = clwdrun[0].text.split("'")[1];
        } else {
            data = dom.querySelector('div#epX');
            mangaid = data.getAttribute('data-label');
        }
        let mydiv = document.createElement('div');
        mydiv.innerHTML = mangaid;
        mangaid = mydiv.textContent;

        let chapterslist = await this._getChapterListFromPages(manga, mangaid);
        return chapterslist;
    }

    async _getChapterListFromPages(manga, mangaid) {
        let chapterslist = [];
        const request = new Request(new URL('/feeds/posts/default/-/'+mangaid+'?orderby=published&alt=json&max-results=999', this.url), this.requestOptions);
        const { feed } = await this.fetchJSON(request);

        chapterslist = feed.entry.map(entry => {
            const goodLink = entry.link.find(link => link.rel === 'alternate');
            return {
                id: this.getRootRelativeOrAbsoluteLink(goodLink.href, request.url),
                title: goodLink.title.replace(/.*(?=Chapter)/g, '').trim()
            };
        }).filter(chap => chap.id != manga.id);
        return chapterslist;
    }

    async _getPages(chapter) {
        let scriptPages = `
        new Promise(resolve => {
            resolve([...document.querySelectorAll('article#reader img')].map(img => img.src));
        });
        `;
        let request = new Request(this.url + chapter.id, this.requestOptions);
        return await Engine.Request.fetchUI(request, scriptPages);
    }

    async _getMangaFromURI(uri) {
        const request = new Request(uri, this.requestOptions);
        const id = uri.pathname;
        const title = (await this.fetchDOM(request, this.queryMangaTitle))[0].textContent.trim();
        return new Manga(this, id, title);
    }
}
