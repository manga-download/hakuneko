import SpeedBinb from './templates/SpeedBinb.mjs';
import Manga from '../engine/Manga.mjs';

export default class Futabanet extends SpeedBinb {

    constructor() {
        super();
        super.id = 'futabanet';
        super.label = 'がうがうモンスター (Futabanet Monster)';
        this.tags = [ 'manga', 'japanese' ];
        this.url = 'https://gaugau.futabanet.jp';
    }

    async _getMangaFromURI(uri) {
        let request = new Request(uri, this.requestOptions);
        let data = await this.fetchDOM(request, 'div.works__grid div.list__text div.mbOff h1');
        let id = uri.pathname;
        let title = data[0].textContent.trim();
        return new Manga(this, id, title);
    }

    async _getMangas() {
        let request = new Request(new URL('/list/works', this.url), this.requestOptions);
        let pages = await this.fetchDOM(request, 'ol.pagination li:not([class]) a');
        pages = Number( new URL(pages.pop().href).searchParams.get('page') );

        let data;
        let mangas = [];
        for (let page = 1; page <= pages; page++) {
            request = new Request(this.url + '/list/works?page=' + page);
            data = await this.fetchDOM(request, 'div.works__grid div.list__box h4 a');
            mangas.push( ...data.map(element => {
                return {
                    id: this.getRootRelativeOrAbsoluteLink(element, this.url),
                    title: element.textContent.trim()
                };
            }));
        }
        return mangas;
    }

    async _getChapters(manga) {
        let request = new Request(new URL(manga.id+'/episodes', this.url), this.requestOptions);
        let data = await this.fetchDOM(request, 'div.episode__grid a');
        return data.map(element => {
            const epnum = element.querySelector('.episode__num').textContent.trim();
            const title = element.querySelector('.episode__title').textContent.trim();

            return {
                id: this.getRootRelativeOrAbsoluteLink(element, request.url),
                title: title ? [epnum, title].join(' - ') : epnum,
            };
        });
    }
}
