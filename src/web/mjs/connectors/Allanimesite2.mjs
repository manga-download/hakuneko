import Allanimesite from './Allanimesite.mjs';
import Manga from '../engine/Manga.mjs';
import FileMoon from '../videostreams/FileMoon.mjs';

export default class Allanimesite2 extends Allanimesite {
    constructor() {
        super();
        super.id = 'allanimesite2';
        super.label = 'AllAnime.site (Animes)';
        this.tags = ['anime', 'multi-lingual'];
        this.url = 'https://allanime.to';
        this.requestOptions.headers.set('x-origin', this.url);

    }

    get icon() {
        return '/img/connectors/allanimesite';
    }

    canHandleURI(uri) {
        return /(www\.)?allanime\.to\/anime/.test(uri);
    }

    async _getMangaFromURI(uri) {
        const id = uri.pathname.match(/\/bangumi\/([^/]+)/)[1];
        const { data }= await this._getAnime(id);
        return new Manga(this, data.show._id, data.show.name);
    }

    async _getMangasFromPage(page) {

        const jsonVariables = {
            search : {
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
        const uri = new URL(`/api?${params}`, this.api);
        const request = new Request(uri, this.requestOptions);
        const data = await this.fetchJSON(request);
        if (!data.data) return [];
        return data.data.shows.edges.map(element => {
            let id = element._id;//+'/'+element.name.replace(/[^a-zA-Z0-9]+/g, '-').toLowerCase();
            //id += element.slugTime ? '-st-'+element.slugTime : '';
            return {
                id: id,
                title: element.englishName ? element.englishName : element.name,
            };
        });
    }

    async _getAnime(id) {
        const jsonVariables = {
            _id : id
        };

        const jsonExtensions = {
            persistedQuery : {
                version  : 1,
                sha256Hash : "9d7439c90f203e534ca778c4901f9aa2d3ad42c06243ab2c5e6b79612af32028"
            }
        };

        const params = new URLSearchParams({ variables : JSON.stringify(jsonVariables), extensions : JSON.stringify(jsonExtensions) });
        const uri = new URL(`/api?${params}`, this.api);
        const request = new Request(uri, this.requestOptions);
        return await this.fetchJSON(request);
    }

    async _getChapters(manga) {
        const { data } = await this._getAnime(manga.id);
        let chapterlist = [];

        let subchapters = data.show.availableEpisodesDetail.sub;
        subchapters.forEach(chapter => {
            chapterlist.push({
                id : JSON.stringify({
                    mangaid : manga.id,
                    chapternumber : chapter,
                    language : 'sub',
                }),
                title : 'Episode '+ chapter+' [SUB]',
                language : 'SUB',
            });
        });

        let rawchapters = data.show.availableEpisodesDetail.raw;
        rawchapters.forEach(chapter => {
            chapterlist.push({
                id : JSON.stringify({
                    mangaid : manga.id,
                    chapternumber : chapter,
                    language : 'raw',
                }),
                title : 'Episode '+ chapter+' [RAW]',
                language : 'RAW',
            });
        });

        let dubchapters = data.show.availableEpisodesDetail.dub;
        dubchapters.forEach(chapter => {
            chapterlist.push({
                id : JSON.stringify({
                    mangaid : manga.id,
                    chapternumber : chapter,
                    language : 'dub',

                }),
                title : 'Episode '+ chapter+' [DUB]',
                language : 'DUB',
            });
        });

        return chapterlist;
    }

    async _getPages(chapter) {
        //const tested = ['Default', 'Luf-hls', 'Luf-mp4', 'Fm-Hls', 'Yt-mp4', 'Ak', 'S-mp4', 'Sak', 'Vid-mp4'];
        //const validSources_old = ['Default', 'Luf-hls', 'Luf-mp4', 'Fm-Hls', 'Ac'];
        const validSources= ['Default', 'Luf-hls', 'Luf-mp4', 'Fm-Hls', 'Ac'];
        const chapterid = JSON.parse(chapter.id);

        const jsonVariables = {
            showId : chapterid.mangaid,
            translationType: chapterid.language,
            episodeString: chapterid.chapternumber
        };

        const jsonExtensions = {
            persistedQuery : {
                version  : 1,
                sha256Hash : "5f1a64b73793cc2234a389cf3a8f93ad82de7043017dd551f38f65b89daa65e0"
            }
        };

        const params = new URLSearchParams({ variables : JSON.stringify(jsonVariables), extensions : JSON.stringify(jsonExtensions) });
        const uri = new URL(`/api?${params}`, this.api);
        let request = new Request(uri, this.requestOptions);
        let { data } = await this.fetchJSON(request);

        let sourceUrls = data.episode.sourceUrls;
        sourceUrls = sourceUrls.sort(function (a, b) {
            return b.priority - a.priority;
        });

        //sourceUrls.filter(source => !tested.includes(source.sourceName)).map(source => console.log(source.sourceName));

        const goodSource = sourceUrls.find(source => validSources.includes(source.sourceName));
        if (!goodSource) throw new Error('No source found ! Hakuneko supports only some video source.');

        let sourceURL = goodSource.sourceUrl;
        if(!/^https:/.test(sourceURL)) sourceURL = this.decryptSourceUrl(sourceURL);

        switch (goodSource.sourceName.toLowerCase()) {
            case 'fm-hls': { //FileMoon
                const fMoon = new FileMoon(goodSource.sourceUrl);
                let playlist = await fMoon.getPlaylist();
                return {
                    hash: 'id,language,resolution',
                    mirrors: [ playlist ],
                    subtitles: []
                };
            }

            default: { //"Default, Luf-hls, Luf-mp4"
                let uri = new URL(sourceURL.replace('clock', 'clock.json'), 'https://blog.allanime.day');
                request = new Request(uri, this.requestOptions);
                data = await this.fetchJSON(request);
                let stream = [];

                let links = data.links.sort(function (a, b) {
                    return b.priority - a.priority;
                });

                let link = links.shift();
                if (link.hls) {
                    stream = { mirrors: [ link.link ], subtitles: [], referer : 'https://blog.allanime.day'};
                } else {
                    stream = {video: [ link.link ], subtitles: []};
                }
                return stream;
            }
        }

    }

    decryptSourceUrl(data) {
        try {
            let regex1 = new RegExp('^--');
            if (regex1.test(data)) return data = data.replace(regex1, ''), data = this._decrypt(data, 0x3);
        } catch (error) {/**/}
        try {
            let regex2 = new RegExp('^#-');
            if (regex2.test(data)) return data = data.replace(regex2, ''), data = this._decrypt(data, 0x2);
        } catch (error) {/**/}
        try {
            let regex3 = new RegExp('^##');
            if (regex3.test(data)) return data = this._decrypt(data.replace(regex3, ''), 0x1);
        } catch (error) {/**/}
        try {
            let regex4 = new RegExp('^-#');
            if (regex4.test(data)) return data = data.replace(regex4, ''), data = this._decrypt(data, 0x4);
        } catch (error) {/**/}
        return data;
    }

    _decrypt(data, methodType) {
        const keyz = ['allanimenews', '1234567890123456789', '1234567890123456789012345', 's5feqxw21', 'feqx1'];
        const key = keyz[methodType];

        const a = b => {
            return key.split('').map(keyLetter => keyLetter.charCodeAt(0x0)).reduce((c, d) => c ^ d, b);
        };
        return data.match(/.{1,2}/g).map(letter => parseInt(letter, 0x10)).map(a).map(code => String.fromCharCode(code)).join('');
    }
}
