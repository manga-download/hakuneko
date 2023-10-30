import Connector from '../engine/Connector.mjs';
import Manga from '../engine/Manga.mjs';

export default class TCBScans extends Connector {

    constructor() {
        super();
        super.id = 'tcbscans';
        super.label = 'TCB Scans';
        this.tags = [ 'manga', 'english', 'scanlation' ];
        this.url = 'https://tcbscans.com';
    }

    async _getMangaFromURI(uri) {
        const request = new Request(uri, this.requestOptions);
        const data = await this.fetchDOM(request, 'div.px-4.py-6 > h1');
        return new Manga(this, uri.pathname, data[0].textContent.trim());
    }

    async _getMangas() {
        const uri = new URL('/projects', this.url);
        const request = new Request(uri, this.requestOptions);
        const data = await this.fetchDOM(request, 'div.justify-between > div.flex.flex-col > a');
        return data.map(element => {
            return {
                id: this.getRootRelativeOrAbsoluteLink(element, this.url),
                title: element.textContent.trim()
            };
        });
    }

    async _getChapters(manga) {
        const uri = new URL(manga.id, this.url);
        const request = new Request(uri, this.requestOptions);
        let data = await this.fetchDOM(request, 'div.col-span-2 > a.block.border.border-border');
        return data.map(element => {
            return {
                id: this.getRootRelativeOrAbsoluteLink(element, this.url),
                title: element.querySelector('div.text-lg').textContent.trim().split(manga.title + ' ')[1],
                language: ''
            };
        });
    }

    async _getPages(chapter) {
        const uri = new URL(chapter.id, this.url);
        const request = new Request(uri, this.requestOptions);
        const data = await this.fetchDOM(request, 'picture > source');

        //test if image really exists
        const promiseArray = data.map(page=> new Promise((resolve, reject) =>{
            const request = new Request(page.src, {
                method : 'HEAD',
            });
            fetch(request)
                .then(response => response.status == 200 ? resolve(page.src) : reject());
        }));
        const promises = await Promise.allSettled(promiseArray);
        return promises.filter(promise => /fulfilled/i.test(promise.status)).map(promise => promise.value);
    }
}
