import SpeedBinb from './SpeedBinb.mjs';
import Manga from '../../engine/Manga.mjs';

export default class TakeShobo extends SpeedBinb {

    constructor() {
        super();
        super.id = undefined;
        super.label = undefined;
        this.tags = [];
        this.url = undefined;

        this.queryMangaTitle = 'section.work_main div.col_work_name h1';
        this.queryMangas = 'section.lineup ul li a';
        this.queryMangasTitle = 'source';
        this.queryChapters = 'section.episode div.box_episode div.box_episode_text a:first-of-type';
        this.queryChaptersTitle = 'div.episode_title';
    }

    async _getMangaFromURI(uri) {
        const request = new Request(new URL(uri), this.requestOptions);
        const data = await this.fetchDOM(request, this.queryMangaTitle);
        return new Manga(this, uri.pathname, data[0].textContent.trim());
    }

    async _getMangas() {
        let request = new Request(new URL(this.url + '/'), this.requestOptions);
        let data = await this.fetchDOM(request, this.queryMangas);
        return data.map(element => {
            let title = element.querySelector(this.queryMangasTitle).getAttribute('alt');
            let match = title.match(/『(.*)』/);
            return {
                id: this.getRootRelativeOrAbsoluteLink(element, this.url),
                title: (match ? match[1] : title).trim()
            };
        });
    }

    async _getChapters(manga) {
        let request = new Request(new URL(manga.id, this.url), this.requestOptions);
        let data = await this.fetchDOM(request, this.queryChapters);
        return data.map(element => {
            let title = element.parentElement.querySelector(this.queryChaptersTitle);
            return {
                id: this.getRootRelativeOrAbsoluteLink(element, request.url),
                title: title.innerText.replace(manga.title, '').trim(),
                language: ''
            };
        });
    }
}