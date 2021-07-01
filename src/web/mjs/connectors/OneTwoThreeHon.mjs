import SpeedBinb from './templates/SpeedBinb.mjs';
export default class OneTwoThreeHon extends SpeedBinb {

    constructor() {
        super();
        super.id = 'onetwothreehon';
        super.label = '123hon';
        this.tags = [ 'manga', 'japanese' ];
        this.url = 'https://www.123hon.com';
        this.mangaList = '/polca/web-comic/';

        this.queryMangas = 'ul.comic__list > li > a';
        this.queryChapters = 'div.read-episode li';
    }

    async _getMangas() {
        const request = new Request(new URL(this.mangaList, this.url), this.requestOptions);
        const data = await this.fetchDOM(request, this.queryMangas);
        return data.map(link => {
            return {
                id: this.getRootRelativeOrAbsoluteLink(link, this.url),
                title: link.href.match(/(\w+)\/?$/)[1] // Rather crude, but there are no text titles on the listing
            };
        });
    }

    async _getChapters(manga) {
        const request = new Request(new URL(manga.id, this.url), this.requestOptions);
        const data = await this.fetchDOM(request, this.queryChapters);

        return data.map(element => {
            if (element.querySelector('a')) { // otherwise chapter not available
                return {
                    id: element.querySelector('a').href,
                    title: element.innerText.match(/\s*(.*?)\s+/)[1]
                };
            }
        }).filter(element => element !== undefined);
    }
}