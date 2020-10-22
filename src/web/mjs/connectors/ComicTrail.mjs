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

        this.queryChapters = 'ul.columns > li.column div.chapter-item__inner';

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
                id: this.getRootRelativeOrAbsoluteLink(element, request.url),
                title: element.children[0].getAttribute('alt').trim()
            };
        });
    }

    async _getChapters(manga) {
        let request = new Request(this.url + manga.id, this.requestOptions);
        let data = await this.fetchDOM(request, this.queryChapters);
        let actual = data.map(element => {
            if (element.querySelector('a.button.is-read') == null){
                return;
            }
            let title = [...element.querySelectorAll('p.has-text-weight-bold')].map(el => el.textContent.trim()).join(' ');
            return {
                id: this.getRootRelativeOrAbsoluteLink(`${element.querySelector('a.button.is-read').href}/`, this.url),
                title: title
            };
        });
        var newArray = new Array();
        for (var i = 0; i < actual.length; i++) {
            if (actual[i]) {
                new Array.push(actual[i]);
            }
        }
        return newArray;
    }
}