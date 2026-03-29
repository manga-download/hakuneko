import SpeedBinb from './templates/SpeedBinb.mjs';
import Manga from '../engine/Manga.mjs';
export default class OneTwoThreeHon extends SpeedBinb {

    constructor() {
        super();
        super.id = 'onetwothreehon';
        super.label = '123hon';
        this.tags = [ 'manga', 'japanese' ];
        this.url = 'https://www.123hon.com';
        this.mangaList = ['/polca/web-comic/', '/nova/web-comic'];

        this.queryMangas = 'ul.comic__list > li > a';
        this.queryChapters = 'div.read-episode li';
    }

    async _getMangaFromURI(uri) {
        const request = new Request(uri, this.requestOptions);
        const data = await this.fetchDOM(request, 'div.title-area h2');
        const id = uri.pathname;
        const title = data[0].textContent.trim();
        return new Manga(this, id, title);
    }

    async _getMangas() {
        const mangalist = [];
        for (const path of this.mangaList) {

            const request = new Request(new URL(path, this.url), this.requestOptions);
            const data = await this.fetchDOM(request, this.queryMangas);
            const mangas = data.map(link => {
                return {
                    id: this.getRootRelativeOrAbsoluteLink(link, this.url),
                    title: link.href.match(/(\w+)\/?$/)[1] // Rather crude, but there are no text titles on the listing
                };
            });
            mangalist.push(mangas);
        }
        return mangalist;
    }

    async _getChapters(manga) {
        const request = new Request(new URL(manga.id, this.url), this.requestOptions);
        const data = await this.fetchDOM(request, this.queryChapters);

        return data.map(element => {
            if (element.querySelector('a')) { // otherwise chapter not available
                let link = element.querySelector('a').href;
                if (!/index.html$/.test(link) && !link.endsWith('/')) {
                    link += '/';
                }
                return {
                    id: link,
                    title: element.innerText.match(/\s*(.*?)\s+/)[1]
                };
            }
        }).filter(element => element !== undefined).filter(element => !/#comics-store/.test(element.Identifier));
    }
}
