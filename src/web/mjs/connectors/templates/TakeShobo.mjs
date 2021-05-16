import SpeedBinb from './SpeedBinb.mjs';
import Manga from '../../engine/Manga.mjs';

export default class TakeShobo extends SpeedBinb {

    constructor() {
        super();
        super.id = undefined;
        super.label = undefined;
        this.tags = [];
        this.url = undefined;
        this.path = '/';

        this.queryMangaTitle = 'section.work_main div.col_work_name h1';
        this.queryMangas = 'section.lineup ul li a';
        this.queryMangasTitle = 'source';
        this.queryChapters = 'section.episode div.box_episode div.box_episode_text';
        this.queryChaptersTitle = 'div.episode_title';
        this.queryChaptersLink = 'a:first-of-type';
    }

    async _getMangaFromURI(uri) {
        const request = new Request(new URL(uri), this.requestOptions);
        const data = await this.fetchDOM(request, this.queryMangaTitle);
        return new Manga(this, uri.pathname, data[0].textContent.trim());
    }

    async _getMangas() {
        const uri = new URL(this.path, this.url);
        const request = new Request(uri, this.requestOptions);
        const data = await this.fetchDOM(request, this.queryMangas);
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
        return data.filter(element => element.querySelector(this.queryChaptersLink)).map(element => {
            // NOTE: In some cases the chapter is redirected to an URL correctly ending with a '/'
            //       When using the URL without the ending '/', the SpeedBin template may produce a wrong base URL,
            //       which will lead to 404 errors when acquiring the images
            let id = this.getRootRelativeOrAbsoluteLink(element.querySelector(this.queryChaptersLink), request.url);
            id += id.endsWith('/') ? '' : '/';
            return {
                id: id,
                title: element.querySelector(this.queryChaptersTitle).innerText.replace(manga.title, '').trim(),
                language: ''
            };
        });
    }
}