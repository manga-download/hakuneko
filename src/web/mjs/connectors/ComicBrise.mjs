import SpeedBinb from './templates/SpeedBinb.mjs';
import Manga from '../engine/Manga.mjs';

export default class ComicBrise extends SpeedBinb {

    constructor() {
        super();
        super.id = 'comicbrise';
        super.label = 'comicBrise';
        this.tags = ['manga', 'japanese'];
        this.url = 'https://www.comic-brise.com';
    }

    async _getMangaFromURI(uri) {
        let request = new Request(uri, this.requestOptions);
        let data = await this.fetchDOM(request, '.post-title');
        let id = uri.pathname;
        let title = data[0].innerText.trim();
        return new Manga(this, id, title);
    }

    async _getMangas() {
        const request = new Request(new URL('/titlelist', this.url), this.requestOptions);
        const data = await this.fetchDOM(request, ".list-works a");
        return data.map(element => {
            return {
                id: this.getRootRelativeOrAbsoluteLink(element.pathname, this.url),
                title: element.innerText.trim()
            };
        });
    }
    async _getChapters(manga) {
        const uri = new URL(manga.id, this.url);
        const request = new Request(uri, this.requestOptions);
        const data = await this.fetchDOM(request, '.modal.modal-chapter .modal-body');
        return data.reverse()
            .filter(e => e.querySelector(".banner-trial source").getAttribute("alt") == "FREE")
            .map(element => {
                return {
                    id: element.querySelector('.banner-trial a').pathname,
                    title: element.querySelector('.primary-title').textContent.trim()
                };
            });
    }
}