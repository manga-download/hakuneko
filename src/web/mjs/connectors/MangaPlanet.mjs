import SpeedBinb from './templates/SpeedBinb.mjs';
import Manga from '../engine/Manga.mjs';

export default class MangaPlanet extends SpeedBinb {

    constructor() {
        super();
        super.id = 'mangaplanet';
        super.label = 'Manga Planet';
        this.tags = ['manga', 'english'];
        this.url = 'https://mangaplanet.com';
        this.requestOptions.headers.set('x-referer', this.url + '/');
        this.requestOptions.headers.set('x-cookie', 'mpaconf=' + 18);

    }

    async _getMangaFromURI(uri) {
        const request = new Request(uri, this.requestOptions);
        const data = await this.fetchDOM(request, '.card-body.book-detail h3');
        return new Manga(this, uri.pathname, data[0].innerText.trim());
    }

    async _getMangas() {
        let mangaList = [];
        const uri = new URL('/browse', this.url);
        const request = new Request(uri, this.requestOptions);
        const data = await this.fetchDOM(request, '.pagination :nth-last-child(2) a');
        const pageCount = parseInt(data[0].text);
        for(let page = 1; page <= pageCount; page++) {
            const mangas = await this._getMangasFromPage(page);
            mangaList.push(...mangas);
        }
        return mangaList;
    }

    async _getMangasFromPage(page) {
        const uri = new URL('/browse/title?ttlpage=' + page, this.url);
        const request = new Request(uri, this.requestOptions);
        const data = await this.fetchDOM(request, 'div#Title .row.book-list');
        return data.map(element => {
            return {
                id: this.getRootRelativeOrAbsoluteLink(element.querySelector('a').pathname, this.url),
                title: element.querySelector('h3').innerText.trim()
            };
        });
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
                    title: title + chapter.querySelector('h3 span').innerText.trim()
                });
            }
        }
        return chapters;
    }

}
