import Connector from '../engine/Connector.mjs';
import Manga from '../engine/Manga.mjs';
export default class Allanimesite extends Connector {
    constructor() {
        super();
        super.id = 'allanimesite';
        super.label = 'AllAnime.site (Mangas)';
        this.tags = ['manga', 'webtoon', 'multi-lingual'];
        this.url = 'https://allanime.to';
        this.path = '/allanimeapi';
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
        return /(www\.)?allanime\.to\/manga/.test(uri);
    }
    async _getMangaFromURI(uri) {
        const request = new Request(new URL(uri), this.requestOptions);
        const data = await this.fetchDOM(request, this.queryMangaTitleFromURI);
        const id = uri.pathname.match(/\/manga\/([\S]+)\//)[1];
        const title = data[0].textContent.trim();
        return new Manga(this, id, title);
    }
    async _getMangas() {
        const mangaList = [];
        for(let page = 1, run = true; run; page++) {
            const mangas = await this._getMangasFromPage(page);
            await this.wait(this.config.throttle.value);
            if(mangas.length == 0) {
                run = false;
            } else if (mangaList.length == 0 || mangas[mangas.length - 1].id !== mangaList[mangaList.length - 1].id) {
                mangaList.push(...mangas);
            } else {
                run = false;
            }
        }
        return mangaList;
    }
    async _getMangasFromPage(page) {

        const jsonVariables = {
            search : {
                isManga : true,
                allowAdult : true,
                allowUnknown : true
            },
            limit : 26, //no matter what i do, changing variable is useless as i suspect query is determined by the hash
            page : page,
            translationType : "sub",
            countryOrigin : "ALL"
        };

        const jsonExtensions = {
            persistedQuery : {
                version  : 1,
                sha256Hash : "edbe1fb23e711aa2bf493874a2d656a5438fe9b0b3a549c4b8a831cc2e929bae"
            }
        };

        const params = new URLSearchParams({ variables : JSON.stringify(jsonVariables), extensions : JSON.stringify(jsonExtensions) });
        const uri = new URL(this.path + '?'+ params.toString(), this.url);
        const request = new Request(uri, this.requestOptions);
        const data = await this.fetchJSON(request);
        if (!data.data) return [];
        return data.data.mangas.edges.map(element => {
            return {
                id: element._id,
                title: element.englishName ? element.englishName : element.name,
            };
        });
    }
    async _getChapters(manga) {

        const request = new Request(new URL('/manga/'+manga.id, this.url), this.requestOptions);
        const script = `
        new Promise(resolve => {
            resolve(__NUXT__);
        });
        `;
        const data = await Engine.Request.fetchUI(request, script);
        let chapterlist = [];
        let subchapters = data.fetch['manga:0'].manga.availableChaptersDetail.sub;
        subchapters.forEach(chapter => {
            chapterlist.push({
                id : '/read/'+manga.id+'/chapter-'+chapter+'-sub',
                title : 'Chapter '+ chapter+' [SUB]',
                language : 'SUB',
            });
        });
        let rawchapters = data.fetch['manga:0'].manga.availableChaptersDetail.raw;
        rawchapters.forEach(chapter => {
            chapterlist.push({
                id : '/read/'+manga.id+'/chapter-'+chapter+'-raw',
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
        const sourcename = data.fetch['chapter:0'].selectedSourceName;
        const sourcesArray = data.fetch['chapter:0'].chapters;
        const goodSource = sourcesArray.find(source => source.sourceName == sourcename);

        const pageslist = goodSource.pictureUrls.map( element => {
            return new URL(element.url, goodSource.pictureUrlHead).href;
        });
        return pageslist;
    }
}
