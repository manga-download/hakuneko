import SpeedBinb from './templates/SpeedBinb.mjs';
import Manga from '../engine/Manga.mjs';

export default class futabanet extends SpeedBinb {

    constructor() {
        super();
        super.id = 'futabanet';
        super.label = 'がうがうモンスター (Futabanet Monster)';
        this.tags = [ 'manga', 'japanese' ];
        this.url = 'https://futabanet.jp';
    }

    async _getMangaFromURI(uri) {
        let request = new Request(uri, this.requestOptions);
        let data = await this.fetchDOM(request, 'h2.detail-ex__title');
        let id = uri.pathname;
        let title = data[0].textContent.trim();
        return new Manga(this, id, title);
    }

    async _getMangas() {
        let request = new Request(new URL('/list/monster/serial', this.url), this.requestOptions);
        let pages = await this.fetchDOM(request, 'li.m-pager__last a');
        pages = Number( new URL(pages[0].href).searchParams.get('page') );

        let data;
        let mangas = [];
        for (let page = 0; page <= pages; page++) {
            request = new Request(this.url + '/list/monster/serial?page=' + page);
            data = await this.fetchDOM(request, 'div.m-result-list__item a');
            mangas.push( ...data.map(element => {
                return {
                    id: this.getRootRelativeOrAbsoluteLink('/list/monster' + element.href, this.url),
                    title: element.querySelector('.m-result-list__title').textContent.trim()
                };
            }));
        }
        return mangas;
    }

    async _getChapters(manga) {
        let request = new Request(new URL(manga.id, this.url), this.requestOptions);
        let data = await this.fetchDOM(request, 'section.detail-sec.detail-ex div.detail-ex__btn-item a');
        return data.map(element => {
            let title = element.querySelector('span:not(.new)');
            return {
                id: this.getRootRelativeOrAbsoluteLink(element, request.url),
                title: title.innerText.replace(/\(\d+\.\d+(.*)\)$/, '').trim(),
            };
        });
    }

}
