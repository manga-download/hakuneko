import SpeedBinb from './templates/SpeedBinb.mjs';
import Manga from '../engine/Manga.mjs';

export default class ComicValkyrie extends SpeedBinb {

    constructor() {
        super();
        super.id = 'comicvalkyrie';
        super.label = 'Comic Valkyrie';
        this.tags = ['manga', 'japanese'];
        this.url = 'https://www.comic-valkyrie.com';
    }

    async _getChapters(manga) {
        const uri = new URL(manga.id, this.url);
        const request = new Request(uri, this.requestOptions);
        const data = await this.fetchDOM(request, '#new_story .title, #back_number .title');
        return data.map(element => {
            const a = element.parentElement.querySelector('a.read_bt');
            return {
                id: a.href,
                title: element.textContent,
                language: ''
            };
        });
    }

    async _getMangaFromURI(uri) {
        let request = new Request(uri, this.requestOptions);
        let data = await this.fetchDOM(request, 'meta[property="og:title"]', 3);
        let id = uri.pathname.slice(1);
        let title = this.cleanMangaTitle(data[0].content);
        return new Manga(this, id, title);
    }

    async _getMangas() {
        let request = new Request(this.url + '/list', this.requestOptions);
        let data = await this.fetchDOM(request, '.box_wrap .box');
        return data.map(element => ({
            id: new URL(element.querySelector('a').href).pathname.replace('/new.html', '').slice(1),
            title: this.cleanMangaTitle(element.querySelector('.title').textContent),
        }));
    }

    cleanMangaTitle(str) {
        return str.replace(/\s*THE COMIC\s*/i, '').trim();
    }
}
