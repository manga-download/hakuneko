import Allanimesite from './Allanimesite.mjs';
import Manga from '../engine/Manga.mjs';
import FileMoon from '../videostreams/FileMoon.mjs';
import StreamSB from '../videostreams/StreamSB.mjs';

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
                sha256Hash : "06327bc10dd682e1ee7e07b6db9c16e9ad2fd56c1b769e47513128cd5c9fc77a"
            }
        };

        const params = new URLSearchParams({ variables : JSON.stringify(jsonVariables), extensions : JSON.stringify(jsonExtensions) });
        const uri = new URL(this.path + '?'+ params.toString(), this.url);
        const request = new Request(uri, this.requestOptions);
        const data = await this.fetchJSON(request);
        if (!data.data) return [];
        return data.data.shows.edges.map(element => {
            let id = '/anime/'+element._id+'/'+element.name.replace(/[^a-zA-Z0-9]+/g, '-').toLowerCase();
            id += element.slugTime ? '-st-'+element.slugTime : '';
            return {
                id: id,
                title: element.englishName ? element.englishName : element.name,
            };
        });
    }
    async _getChapters(manga) {
        let request = new Request(new URL(manga.id, this.url), this.requestOptions);
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
        const validSources = ['Default', 'Luf-hls', 'Luf-mp4', 'Fm-Hls', 'Ss-Hls'];
        let request = new Request(new URL(chapter.id, this.url), this.requestOptions);
        const script = `
        new Promise(resolve => {
            resolve(__NUXT__);
        });
        `;
        let data = await Engine.Request.fetchUI(request, script);
        let sourcesArray = data.fetch['episode:0'].episodeSelections;
        sourcesArray = sourcesArray.sort(function (a, b) {
            return b.priority - a.priority;
        });
        const goodSource = sourcesArray.find(source => validSources.includes(source.sourceName));
        if (!goodSource) throw new Error('No source found ! Hakuneko supports only some video source.');

        switch (goodSource.sourceName.toLowerCase()) {
            case 'fm-hls': { //FileMoon
                let fMoon = new FileMoon(goodSource.sourceUrl);
                let playlist = await fMoon.getPlaylist();
                return {
                    hash: 'id,language,resolution',
                    mirrors: [ playlist ],
                    subtitles: []
                };
            }
            case 'ss-hls': {//StreamSB
                const SB = new StreamSB(goodSource.sourceUrl);
                let playlist = await SB.getStream();
                return {
                    hash: 'id,language,resolution',
                    mirrors: [ playlist ],
                    subtitles: []
                };
            }
            default: { //"Default, Luf-hls, Luf-mp4"
                let decodedurl = goodSource.sourceUrl.replace('#', '');
                decodedurl = decodedurl.split(/(\w\w)/g).filter(p => !!p).map(c => String.fromCharCode(parseInt(c, 16))).join("");

                let uri = new URL(decodedurl.replace('clock', 'clock.json'), 'https://blog.allanime.pro');
                request = new Request(uri, this.requestOptions);
                data = await this.fetchJSON(request);
                let stream = [];
                let link = data.links.pop();
                if (link.hls) {
                    stream = { mirrors: [ link.link ], subtitles: [], referer : 'https://blog.allanime.pro'};
                } else {
                    stream = {video: [ link.link ], subtitles: []};
                }
                return stream;
            }
        }

    }
}
