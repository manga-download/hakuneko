import Connector from '../engine/Connector.mjs';
import Manga from '../engine/Manga.mjs';

export default class ReaperScans extends Connector {
    constructor() {
        super();
        super.id = 'reaperscans';
        super.label = 'Reaper Scans';
        this.tags = ['webtoon', 'english'];
        this.url = 'https://reaperscans.com';
        this.links = {
            login: 'https://reaperscans.com/login'
        };
        this.requestOptions.headers.set('x-referer', this.url);
        this.path = '/comics';
        this.queryMangas = 'a.my-2.text-sm.font-medium.text-white.hover\\3A text-blue-700';
        this.queryChapters = 'div[wire\\3A id] ul[role] li a';
        this.queryPages = 'main source.max-w-full';
        this.queryMangaTitle = 'h1.text-xl';
        this.config = {
            throttle: {
                label: 'Chapter list Throttle [ms]',
                description: 'Enter the timespan in [ms] to delay consecutive requests to the website api for Chapter list fetching',
                input: 'numeric',
                min: 100,
                max: 10000,
                value: 1000
            }
        };
    }

    async _getMangas() {
        const mangaList = [];
        for (let page = 1, run = true; run; page++) {
            await this.wait(this.config.throttle.value);
            let mangas = await this._getMangasFromPage(page);
            mangas.length > 0 ? mangaList.push(...mangas) : run = false;
        }
        return mangaList;
    }

    async _getMangasFromPage(page) {
        const uri = new URL(this.path + '?page='+page, this.url);
        const request = new Request(uri, this.requestOptions);
        await this.wait(this.config.throttle.value);
        const data = await this.fetchDOM(request, this.queryMangas);
        return data.map(element => {
            return{
                id: this.getRootRelativeOrAbsoluteLink(element, request.url),
                title : element.text.trim()
            };
        });
    }

    async _getChapters(manga) {
        const uri = new URL(manga.id, this.url);
        const [ data ] = await this.fetchDOM(new Request(uri, this.requestOptions), 'main div[wire\\:id][wire\\:initial-data]');
        const chapterList = this.getChaptersFromDoc(data);
        const body = JSON.parse(data.getAttribute('wire:initial-data'));
        delete body.effects;
        for(let page = 2, run = true; run; page++) {
            await this.wait(this.config.throttle.value);
            const chapters = await this.getChaptersFromPage(manga, page, body);
            chapters.length > 0 ? chapterList.push(...chapters) : run = false;
        }
        return chapterList;
    }

    async getChaptersFromPage(manga, page, body) {
        const uri = new URL(manga.id, this.url);
        uri.pathname = '/livewire/message/' + body.fingerprint.name;

        body.updates = [{
            type: 'callMethod',
            payload: {
                id: '00000',
                method: 'gotoPage',
                params: [ page, 'page' ]
            }
        }];

        const request = new Request(uri, {
            method: 'POST',
            body: JSON.stringify(body),
            headers: {
                'Content-Type': 'application/json'
            }
        });
        const message = await this.fetchJSON(request);
        const dom = new DOMParser().parseFromString(message.effects.html, 'text/html');
        return this.getChaptersFromDoc(dom);
    }

    getChaptersFromDoc(doc) {
        const chapterList = [];
        const data = doc.querySelectorAll(this.queryChapters);
        data.forEach(element => {
            let chapter = {
                id: element.pathname,
                title : element.querySelector('p').textContent.trim()
            };
            chapterList.push(chapter);
        });
        return chapterList;
    }

    async _getPages(chapter) {
        const uri = new URL(chapter.id, this.url);
        const request = new Request(uri, this.requestOptions);
        const data = await this.fetchDOM(request, this.queryPages);
        return data.map(element => {
            return this.getAbsolutePath(element.getAttribute('src'), this.url);
        });
    }

    async _getMangaFromURI(uri) {
        const request = new Request(uri, this.requestOptions);
        const id = uri.pathname;
        const title = (await this.fetchDOM(request, this.queryMangaTitle))[0].textContent.trim();
        return new Manga(this, id, title);
    }
}
