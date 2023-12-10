import Connector from '../engine/Connector.mjs';
import Manga from '../engine/Manga.mjs';

export default class ReaperScans extends Connector {
    constructor() {
        super();
        super.id = 'reaperscans';
        super.label = 'Reaper Scans';
        this.tags = ['webtoon', 'english'];
        this.url = 'https://reapercomics.com';
        this.links = {
            login: 'https://reapercomics.com/login'
        };
        this.path = '/comics';
        this.queryMangas = 'a.my-2.text-sm.font-medium.text-white.hover\\3A text-blue-700';
        this.queryChapters = 'div[wire\\3A id] ul[role] li a';
        this.queryPages = 'source.max-w-full.mx-auto.display-block';
        this.queryMangaTitle = 'div.overflow-hidden h1';
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
        let mangaList = [];
        for (let page = 1, run = true; run; page++) {
            let mangas = await this._getMangasFromPage(page);
            mangas.length > 0 ? mangaList.push(...mangas) : run = false;
        }
        return mangaList;
    }
    async _getMangasFromPage(page) {
        let uri = new URL(this.path + '?page='+page, this.url);
        let request = new Request(uri, this.requestOptions);
        let data = await this.fetchDOM(request, this.queryMangas);
        return data.map(element => {
            return{
                id: this.getRootRelativeOrAbsoluteLink(element, request.url),
                title : element.text.trim()
            };
        });
    }
    async _getChapters(manga) {
        const messageurl="https://reaperscans.com/livewire/message/";
        let chapterList = [];
        let requestdata = undefined;
        let chapters = [];
        //fetch first page for csrf-token, wireid and other informations
        let url = new URL(manga.id, this.url);
        let request = new Request(url, this.requestOptions);
        let response = await fetch(request);
        let responseText = await response.text();
        //and chapters from first page
        let parser = new DOMParser();
        let doc = parser.parseFromString(responseText, 'text/html');
        chapters = this.getChaptersFromDoc(doc);
        chapterList.push(...chapters);
        //build payload from first page data
        requestdata = this.createPayloadForChapterPages(doc);
        for (let page = 2, run = true; run; page++) {
            chapters = [];
            url = new URL(requestdata.payload.fingerprint.name, messageurl);
            request = new Request(url, {
                method: 'POST',
                mode: 'cors',
                referrer: requestdata.referrer,
                referrerPolicy: 'strict-origin-when-cross-origin',
                body: JSON.stringify(requestdata.payload),
                credentials: 'include',
                headers: {
                    'Accept': 'text/html, application/xhtml+xml',
                    "Content-Type": "application/json",
                    "X-CSFRF-TOKEN": requestdata.token,
                    "X-Livewire": "true",
                    'x-referrer': requestdata.referrer,
                }
            });
            response = await fetch(request);
            let data = await response.json();
            //data contains the html nodes with the chapters
            //and the informations needed to request the next page
            doc = parser.parseFromString(data.effects.html, 'text/html');
            chapters = this.getChaptersFromDoc(doc);
            chapters.length > 0 ? chapterList.push(...chapters) : run = false;
            //update payload data using response data, for next fetch
            requestdata.payload.serverMemo.checksum = data.serverMemo.checksum;
            requestdata.payload.serverMemo.htmlHash = data.serverMemo.htmlHash;
            requestdata.referrer = new URL(manga.id+"?page="+page, this.url).href;
            requestdata.payload.serverMemo.data.page = page;
            requestdata.payload.serverMemo.data.paginators.page = page;
            requestdata.payload.updates[0].payload.params[0] = page+1;
            await this.wait(this.config.throttle.value);
        }
        return chapterList;
    }
    getChaptersFromDoc(doc) {
        let chapterList = [];
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
    createPayloadForChapterPages(doc) {
        const token = doc.querySelector('meta[name="csrf-token"]').getAttribute("content");
        const payloadid = (Math.random() + 1).toString(36).substring(8);
        let wiredata = JSON.parse(doc.querySelector('.max-w-6xl div[wire\\:initial-data]').getAttribute("wire:initial-data"));
        const referrer = wiredata.effects.path;//of course the current url could be used too and i
        delete wiredata.effects;
        wiredata.serverMemo.data.page = 1;
        wiredata.serverMemo.data.paginators.page = 1;
        wiredata['updates']=[{
            type: "callMethod",
            payload: {
                id: payloadid,
                method: "gotoPage",
                params: [
                    2,
                    "page"
                ]
            }
        }];
        return {
            payload : wiredata, token :token, referrer : referrer};
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
        const title = (await this.fetchDOM(request, this.queryMangatitle))[0].textContent.trim();
        return new Manga(this, id, title);
    }
}
