import Allanimesite from './Allanimesite.mjs';
import Manga from '../engine/Manga.mjs';

export default class Allanimesite2 extends Allanimesite {
    constructor() {
        super();
        super.id = 'allanimesite2';
        super.label = 'AllAnime.site (Animes)';
        this.tags = ['anime', 'multi-lingual'];
    }
    get icon() {
        return '/img/connectors/allanimesite';
    }
    canHandleURI(uri) {
        return /(www\.)?allanime\.to\/anime/.test(uri);
    }
    async _getMangaFromURI(uri) {
        const request = new Request(new URL(uri), this.requestOptions);
        const data = await this.fetchDOM(request, this.queryMangaTitleFromURI);
        const id = uri.pathname;
        const title = data[0].textContent.trim();
        return new Manga(this, id, title);
    }

    async _getMangasFromPage(page) {

        const jsonVariables = {
            search : {
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
                sha256Hash : "b645a686b1988327795e1203867ed24f27c6338b41e5e3412fc1478a8ab6774e"
            }
        };

        const params = new URLSearchParams({ variables : JSON.stringify(jsonVariables), extensions : JSON.stringify(jsonExtensions) });
        const uri = new URL(this.path + '?'+ params.toString(), this.url);
        const request = new Request(uri, this.requestOptions);
        const data = await this.fetchJSON(request);
        if (!data.data) return [];
        return data.data.shows.edges.map(element => {
            return {
                id: '/anime/'+element._id,
                title: element.englishName ? element.englishName : element.name,
            };
        });
    }
    async _getChapters(manga) {
        const request = new Request(new URL(manga.id, this.url), this.requestOptions);
        let script = `
        new Promise(resolve => {
            resolve(__NUXT__);
        });
        `;
        let data = await Engine.Request.fetchUI(request, script);
        let chapterlist = [];
        const mangaid = manga.id.replace('/anime/', '/watch/');
        let subchapters = data.fetch['anime:0'].show.availableEpisodesDetail.sub;
        subchapters.forEach(chapter => {
            chapterlist.push({
                id : mangaid+'/episode-'+chapter+'-sub',
                title : 'Episode '+ chapter+' [SUB]',
                language : 'SUB',
            });
        });
        let rawchapters = data.fetch['anime:0'].show.availableEpisodesDetail.raw;
        rawchapters.forEach(chapter => {
            chapterlist.push({
                id : mangaid+'/episode-'+chapter+'-raw',
                title : 'Episode '+ chapter+' [RAW]',
                language : 'RAW',
            });
        });
        let dubchapters = data.fetch['anime:0'].show.availableEpisodesDetail.dub;
        dubchapters.forEach(chapter => {
            chapterlist.push({
                id : mangaid+'/episode-'+chapter+'-dub',
                title : 'Episode '+ chapter+' [DUB]',
                language : 'DUB',
            });
        });
        return chapterlist;
    }
    async _getPages(chapter) {
        let request = new Request(new URL(chapter.id, this.url), this.requestOptions);
        const script = `
        new Promise(resolve => {
            resolve(__NUXT__);
        });
        `;
        let data = await Engine.Request.fetchUI(request, script);
        const sourcesArray = data.fetch['episode:0'].episodeSelections;
        const goodSource = sourcesArray.find(source => source.sourceName == 'Default');
        if (!goodSource) throw new Error('No Default source found ! Hakuneko supports only default video source.');
        let uri = new URL(goodSource.sourceUrl.replace('clock', 'clock.json'), 'https://blog.allanime.pro');
        request = new Request(uri, this.requestOptions);
        data = await this.fetchJSON(request);
        let stream = [];
        let link = data.links[0];
        if (link.hls) {
            stream = { mirrors: [ link.link ], subtitles: [], referer : 'https://blog.allanime.pro'};
        } else {
            stream = {video: [ link.link ], subtitles: []};
        }
        return stream;
    }
}
