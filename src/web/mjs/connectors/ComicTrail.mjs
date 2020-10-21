import SpeedBinb from './templates/SpeedBinb.mjs';
import Manga from '../engine/Manga.mjs';

export default class ComicTrail extends SpeedBinb {

    constructor() {
        super();
        super.id = 'comictrail';
        super.label = 'Comic Trail (コミックトレイル)';
        this.tags = [ 'manga', 'japanese' ];
        this.url = 'https://comic-trail.jp';

        this.queryManga = 'section.section div.columns div.column div > a';

        this.queryChapters = 'section.section > ul.columns > li.column.is-full-mobile.is-half-tablet.chapter-item div.columns.is-mobile.is-gapless.chapter-item__inner';

    }

    async _getMangaFromURI(uri) {
        let request = new Request(uri, this.requestOptions);
        let data = await this.fetchDOM(request, 'div.series-detail h1.is-size-2');
        let id = uri.pathname + uri.search;
        let title = data[0].textContent.trim();
        return new Manga(this, id, title);
    }

    async _getMangas() {
        let request = new Request(this.url + '/series', this.requestOptions);
        let data = await this.fetchDOM(request, this.queryManga);
        return data.map(element => {
            return {
                id: this.getRootRelativeOrAbsoluteLink(element.href, request.url),
                title: element.children[0].attributes[2].value.trim()
            };
        });
    }

    async _getChapters(manga) {
        let request = new Request(this.url + manga.id, this.requestOptions);
        let data = await this.fetchDOM(request, this.queryChapters);
        return data.map(element => {
            let part = "";
            if (!/\d{4}-\d{1,2}-\d{1,2}/.test(element.children[1].firstElementChild.firstElementChild.children[1].textContent)){
                part = ` ${element.children[1].firstElementChild.firstElementChild.children[1].textContent.trim()}`;
            }
            return {
                id: this.getRootRelativeOrAbsoluteLink(`${element.firstElementChild.firstElementChild.pathname}/` || "", this.url),
                title: element.children[1].firstElementChild.firstElementChild.firstElementChild.textContent.trim() + part
            };
        });
    }
}