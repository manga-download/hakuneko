import Connector from '../engine/Connector.mjs';
import Manga from '../engine/Manga.mjs';
export default class NextScan extends Connector {
    constructor() {
        super();
        super.id = 'nextscan';
        super.label = 'NextScan';
        this.tags = [ 'manga', 'webtoon', 'scanlation', 'indonesian' ];
        this.url = 'https://www.nextscanid.my.id';
        this.queryChaptersPerPage = 20;
        this.queryMangasPerPage = 20;
        this.queryMangaTitleRemove = 'Bahasa Indonesia';
        this.queryMangaTitle = 'header > h1';
    }
    async _getMangas() {
        let mangalist = [];
        for (let page = 0, run = true; run; page++) {
            let mangas = await this._getMangaListFromPages(page);
            mangas.length > 0 ? mangalist.push(...mangas) : run = false;
        }
        return mangalist;
    }
    async _getMangaListFromPages(page ) {
        const uri = new URL('/feeds/posts/default/-/Series?orderby=published&alt=json&start-index='+ ( this.queryMangasPerPage * page + 1 )+'&max-results='+this.queryMangasPerPage, this.url);
        const request = new Request(uri, this.requestOptions);
        const data = await this.fetchJSON(request);
        let parser = new DOMParser();
        if (!data.feed.entry) return [];
        return data.feed.entry.map( entry => {
            let doc = parser.parseFromString(entry.content.$t, 'text/html');
            let titlediv = doc.querySelector('div#custom-doc-title');
            let title = !titlediv ? entry.title.$t.trim() : titlediv.textContent.replace( this.queryMangaTitleRemove, '' ).trim();
            return {
                id: this.getRootRelativeOrAbsoluteLink( entry.link.find( a => a.rel === 'alternate' ).href, request.url ),
                title: title
            };
        });
    }
    async _getChapters(manga) {
        let uri = new URL(manga.id, this.url);
        let request = new Request(uri, this.requestOptions);
        let dom = (await this.fetchDOM(request, 'body'))[0];
        let data = [...dom.querySelectorAll('script')];
        // The mangaid to pass to the api is inconsistent, sometimes it can be foundin a script as clwd.run('mangaid'), sometimes its in a <div id = 'epX'>.
        // There are also script object that are populated with chapters but sometimes they are empty for whatever reasons.
        // Moreover, the website pass the mangaid to the api without taking care of resolving htlmentities, causing some manga page not displaying chapters list.
        // Manganame cant be used as sometimes its different (translated or case is different, causing the api to fail again)
        // TLDR : the website is a fucking mess.
        const clwdrun = data.filter(el => el.text.trim().startsWith('clwd.run'));
        let mangaid= '';
        if (clwdrun.length > 0) {
            mangaid = clwdrun[0].text.split("'")[1];
        } else {
            data = dom.querySelector('div#epX');
            mangaid = data.getAttribute('data-label');
        }
        //HACK : RESOLVE HTMLENTITIES
        let mydiv = document.createElement('div');
        mydiv.innerHTML = mangaid;
        mangaid = mydiv.textContent;
        //now use the RSS feed api
        let chapterslist = [];
        for (let page = 0, run = true; run; page++) {
            let chapters = await this._getChapterListFromPages(page, manga, mangaid);
            chapters.length > 0 ? chapterslist.push(...chapters) : run = false;
        }
        return chapterslist;
    }
    async _getChapterListFromPages(page, manga, mangaid) {
        const uri = new URL('/feeds/posts/default/-/'+mangaid+'?orderby=published&alt=json&start-index='+ ( this.queryMangasPerPage * page + 1 )+'&max-results='+this.queryMangasPerPage, this.url);
        const request = new Request(uri, this.requestOptions);
        let data = await this.fetchJSON(request);
        if (!data.feed.entry) return [];
        return data.feed.entry.map( entry => {
            return {
                id: this.getRootRelativeOrAbsoluteLink( entry.link.find( a => a.rel === 'alternate' ).href, request.url ),
                title: entry.title.$t.replace( this.queryMangaTitleRemove, '' ).replace(manga.title, '').trim()
            };
        }).filter(chap => chap.id != manga.id);//We dont want the link to the manga, which is always included
    }
    async _getPages(chapter) {
        let scriptPages = `
        new Promise(resolve => {
            resolve([...document.querySelectorAll('div#readerarea img')].map(img => img.src));
        });
        `;
        let request = new Request(this.url + chapter.id, this.requestOptions);
        return await Engine.Request.fetchUI(request, scriptPages);
    }
    async _getMangaFromURI(uri) {
        const request = new Request(uri, this.requestOptions);
        const id = uri.pathname;
        const title = (await this.fetchDOM(request, this.queryMangaTitle))[0].textContent.replace(this.queryMangaTitleRemove, '').trim();
        return new Manga(this, id, title);
    }
}