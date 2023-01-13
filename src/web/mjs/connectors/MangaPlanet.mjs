import SpeedBinb from './templates/SpeedBinb.mjs';
import Manga from '../engine/Manga.mjs';

export default class MangaPlanet extends SpeedBinb {

    constructor() {
        super();
        super.id = 'mangaplanet';
        super.label = 'Manga Planet';
        this.tags = ['manga', 'english'];
        this.url = 'https://read.mangaplanet.com';
        this.requestOptions.headers.set('x-referer', this.url + '/');
        this.requestOptions.headers.set('x-cookie', 'faconf=' + 18);

    }

    async _getMangaFromURI(uri) {
        const request = new Request(uri, this.requestOptions);
        const data = await this.fetchDOM(request, '.card-body.book-detail h3');
        return new Manga(this, uri.pathname, data[0].innerText.trim());
    }

    async _getMangas() {
        let maxPageCount = 1;
        let mangas = [];
        let request = new Request(new URL('/browse?page=1', this.url), this.requestOptions);
        const newpagecount = await this.fetchDOM(request, ".pagination :nth-last-child(2)");
        maxPageCount = parseInt(newpagecount[0].innerText.trim());
        for (let i = 1; i <= maxPageCount; i++) {
            request = new Request(new URL('/browse?page=' + i, this.url), this.requestOptions);
            const data = await this.fetchDOM(request, '.contents.comics .linkbox');
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
                    url = "https://image.mangaplanet.com/viewer/" + chapid;
                }
                chapters.push({
                    id: url,
                    title: title + chapter.querySelector('span').innerText.trim()
                });
            }
        }
        return chapters;
    }

}
