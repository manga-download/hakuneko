import Connector from '../engine/Connector.mjs';
import Manga from '../engine/Manga.mjs';
export default class Allanimesite extends Connector {
    constructor() {
        super();
        super.id = 'allanimesite';
        super.label = 'AllAnime.site (Mangas)';
        this.tags = ['manga', 'webtoon', 'multi-lingual'];
        this.url = 'https://allanime.site';
        this.path = '/allanimeapi';
        this.varQueryMangas = '?variables={"search":{"isManga":true,"allowAdult":true,"allowUnknown":true},"limit":100,"page":%PAGE%,"countryOrigin":"ALL"}&extensions={"persistedQuery":{"version":1,"sha256Hash":"0cf12b2c7e4c571ef8aaae655276b646f485e5022900dd9d721d3bf902d7ef76"}}';
        this.varQueryChapters ='?variables={"_id":"%MANGAID%"}&extensions={"persistedQuery":{"version":1,"sha256Hash":"fbf62e4a2030ecf8bfb9540e0a8a14a300a531cafd82ebb4331e5a3a4a3a4e4e"}}';
        this.queryMangaTitleFromURI = 'ol.breadcrumb li.breadcrumb-item span';
        this.config = {
            throttle: {
                label: 'Manga list Throttle [ms]',
                description: 'Enter the timespan in [ms] to delay consecutive requests to the website api for manga list fetching',
                input: 'numeric',
                min: 100,
                max: 10000,
                value: 1000
            }
        };
    }
    canHandleURI(uri) {
        return /(www\.)?allanime\.site\/manga/.test(uri);
    }
    async _getMangaFromURI(uri) {
        const request = new Request(new URL(uri), this.requestOptions);
        const data = await this.fetchDOM(request, this.queryMangaTitleFromURI);
        const id = uri.pathname.replace(/$\//, '');
        const title = data[0].textContent.trim();
        return new Manga(this, id, title);
    }
    async _getMangas() {
        const mangaList = [];
        for(let page = 1, run = true; run; page++) {
            const mangas = await this._getMangasFromPage(page);
            await this.wait(this.config.throttle.value);
            mangas.length ? mangaList.push(...mangas) : run = false;
        }
        return mangaList;
    }
    async _getMangasFromPage(page) {
        const uri = new URL(this.path + this.varQueryMangas.replace('%PAGE%', page), this.url);
        const request = new Request(uri, this.requestOptions);
        const data = await this.fetchJSON(request);
        if (!data.data) return [];
        return data.data.mangas.edges.map(element => {
            return {
                id: '/manga/'+element._id,
                title: element.englishName ? element.englishName : element.name,
            };
        });
    }
    async _getChapters(manga) {
        let mangaid = manga.id.replace('/manga/', '');
        let uri = new URL(this.path+ this.varQueryChapters.replace('%MANGAID%', mangaid), this.url);
        let request = new Request(uri, this.requestOptions);
        const data = await this.fetchJSON(request);
        let chapterlist = [];
        let subchapters = data.data.manga.availableChaptersDetail.sub;
        subchapters.forEach(chapter => {
            chapterlist.push({
                id : '/read/'+mangaid+'/chapter-'+chapter+'-sub',
                title : 'Chapter '+ chapter+' [SUB]',
                language : 'SUB',
            });
        });
        let rawchapters = data.data.manga.availableChaptersDetail.raw;
        rawchapters.forEach(chapter => {
            chapterlist.push({
                id : '/read/'+mangaid+'/chapter-'+chapter+'-raw',
                title : 'Chapter '+ chapter +' [RAW]',
                language : 'RAW',
            });
        });
        return chapterlist;
    }
    async _getPages(chapter) {
        const request = new Request(new URL(chapter.id, this.url), this.requestOptions);
        const script = `
        new Promise(resolve => {
            resolve(__NUXT__);
        });
        `;
        const data = await Engine.Request.fetchUI(request, script);
        const sourcename = data.fetch[0].selectedSourceName;
        const sourcesArray = data.fetch[0].chapters;
        const goodSource = sourcesArray.find(source => source.sourceName == sourcename);

        const pageslist = goodSource.pictureUrls.map( element => {
            return new URL(element.url, goodSource.pictureUrlHead).href;
        });
        return pageslist;
    }
}
