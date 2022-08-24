import SpeedBinb from './templates/SpeedBinb.mjs';
import Manga from '../engine/Manga.mjs';

export default class Futekiya extends SpeedBinb {

    constructor() {
        super();
        super.id = 'futekiya';
        super.label = 'futekiya';
        this.tags = ['manga', 'english'];
        this.url = 'https://read.futekiya.com';
    }

    async _getMangaFromURI(uri) {
        let request = new Request(uri, this.requestOptions);
        let data = await this.fetchDOM(request, '.card-body.book-detail h3');
        let id = uri.pathname;
        let title = data[0].innerText.trim();
        return new Manga(this, id, title);
    }

    async _getMangas() {
        let maxpagecount = 1;
        let manga = [];
        for (let i = 1; i <= maxpagecount; i++) {
            const request = new Request(new URL('/browse?page=' + i, this.url), this.requestOptions);
            if (maxpagecount == 1) {
                const newpagecount = await this.fetchDOM(request, ".pagination :nth-last-child(2)");
                maxpagecount = parseInt(newpagecount[0].innerText.trim());
            }
            const data = await this.fetchDOM(request, ".contents.comics .linkbox");
            for (let element of data) {
                manga.push({
                    id: this.getRootRelativeOrAbsoluteLink(element.querySelector('a').pathname, this.url),
                    title: element.querySelector('h3').innerText.trim()
                });
            }
        }
        return manga;
    }
    async _getChapters(manga) {
        const uri = new URL(manga.id, this.url);
        const request = new Request(uri, this.requestOptions);
        const data = await this.fetchDOM(request, '#accordion div[id*="vol_"]');
        let mangadownloads = [];
        for (let volume of data) {
            const title = volume.querySelector('h3').textContent.trim() + " - ";

            for (let chapter of [...volume.querySelectorAll(".list-group")].filter(e => e.querySelector('a') != null)) {
                const origurl = /'([a-z0-9:\/.?=]*)'/g.exec(chapter.querySelector('a').getAttribute("@click"))[1];
                let url = "";
                if (origurl.includes("/reader/")) {
                    url = "/reader?cid=" + origurl.split("/").slice(-1)[0] + "&sk=1";
                }
                else if (origurl.includes("/viewer/")) {
                    url = "https://image.futekiya.com/viewer/" + origurl.split("/").slice(-1)[0];
                }
                mangadownloads.push({
                    id: url,
                    title: title + chapter.querySelector('span').innerText.trim()
                });
            }
        }

        return mangadownloads;
    }
    _getPageList(manga, chapter, callback) {
        this.requestOptions.headers.set('x-referer', "https://read.futekiya.com/");
        let data = super._getPageList(manga, chapter, callback);
        const url = new URL(chapter.id, this.baseURL);
        this.requestOptions.headers.set('x-referer', url);
        return data;
    }
}