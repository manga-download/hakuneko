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
        let maxPageCount = 1;
        let mangas = [];
        let request = new Request(new URL('/browse?page=1', this.url), this.requestOptions);
        const newpagecount = await this.fetchDOM(request, ".pagination :nth-last-child(2)");
        maxPageCount = parseInt(newpagecount[0].innerText.trim());
        for (let i = 1; i <= maxPageCount; i++) {
            request = new Request(new URL('/browse?page=' + i, this.url), this.requestOptions);
            const data = await this.fetchDOM(request, ".contents.comics .linkbox");
            for (let element of data) {
                mangas.push({
                    id: this.getRootRelativeOrAbsoluteLink(element.querySelector('a').pathname, this.url),
                    title: element.querySelector('h3').innerText.trim()
                });
            }
        }
        return mangas;
    }
    async _getChapters(manga) {
        const uri = new URL(manga.id, this.url);
        const request = new Request(uri, this.requestOptions);
        const data = await this.fetchDOM(request, '#accordion div[id*="vol_"]');
        let chapters = [];
        for (let volume of data) {
            const title = volume.querySelector('h3').textContent.trim() + " - ";

            for (let chapter of [...volume.querySelectorAll(".list-group")].filter(e => e.querySelector('a') != null)) {
                const origurl = /'([a-z0-9:/.?=]*)'/g.exec(chapter.querySelector('a').getAttribute("@click"))[1];
                //the chapter site gives different urls. sometimes you first get redirected to a login or 18+ restricted page other times not.
                let chapid = origurl.split("/").slice(-1)[0];
                if (chapid.includes("?")) {
                    chapid = chapid.split("=").slice(-1)[0];//gets the id of the cid parameter
                }
                let url = "";
                if (origurl.includes("/reader")) {
                    url = "/reader?cid=" + chapid + "&sk=1";
                } else if (origurl.includes("/viewer")) {
                    url = "https://image.futekiya.com/viewer/" + chapid;
                }
                chapters.push({
                    id: url,
                    title: title + chapter.querySelector('span').innerText.trim()
                });
            }
        }

        return chapters;
    }
    _getPageList(manga, chapter, callback) {
        this.requestOptions.headers.set('x-referer', this.url + '/');
        //add 18 plus cookie otherwise you can get redirected to a different page
        this.requestOptions.headers.set('x-cookie', 'faconf=' + 18);
        let data = super._getPageList(manga, chapter, callback);
        const url = new URL(chapter.id, this.baseURL);
        this.requestOptions.headers.set('x-referer', url);
        return data;
    }
}