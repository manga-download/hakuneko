import Connector from '../engine/Connector.mjs';
import Manga from '../engine/Manga.mjs';

export default class TenshiMoe extends Connector {

    constructor() {
        super();
        super.id = 'tenshimoe';
        super.label = 'Marin.moe';
        this.tags = [ 'anime', 'english'];
        this.url = 'https://marin.moe';
        this.config = {
            format: {
                label: 'Language Settings',
                description: 'Choose between Subbed or Dubbed anime. If your choice is not available the other is used as fallback',
                input: 'select',
                options: [
                    { value: 'SUB', name: 'Subbed' },
                    { value: 'DUB', name: 'Dubbed' }
                ],
                value: 'SUB'
            },
            resolution: {
                label: 'Preferred Resolution',
                description: 'Try to download video in the selected resolution.\nIf the resolution is not supported, depending on the mirror the download may fail, or a fallback resolution may be used!',
                input: 'select',
                options: [
                    { value: '', name: 'Mirror\'s Default' },
                    { value: '360p', name: '360p' },
                    { value: '480p', name: '480p' },
                    { value: '720p', name: '720p' },
                    { value: '1080p', name: '1080p' }
                ],
                value: ''
            }
        };

    }

    async _getMangaFromURI(uri) {
        const request = new Request(uri, this.requestOptions);
        let data = await this.fetchDOM(request, 'div#app');
        data = JSON.parse(data[0].dataset['page']);
        return new Manga(this, data.props.anime.slug, data.props.anime.title.trim());
    }

    async _getMangas() {
        let mangaList = [];
        const uri = new URL('/anime', this.url);
        const request = new Request(uri, this.requestOptions);
        let data = await this.fetchDOM(request, 'div#app');
        data = JSON.parse(data[0].dataset['page']);
        const pageCount = data.props.anime_list.meta.last_page;
        for(let page = 1; page <= pageCount; page++) {
            const mangas = await this._getMangasFromPage(page);
            mangaList.push(...mangas);
        }
        return mangaList;
    }

    async _getMangasFromPage(page) {
        const uri = new URL('/anime?page=' + page, this.url);
        const request = new Request(uri, this.requestOptions);
        let data = await this.fetchDOM(request, 'div#app');
        data = JSON.parse(data[0].dataset['page']);
        return data.props.anime_list.data.map(element => {
            return {
                id: element.slug,
                title: element.title.trim()
            };
        });
    }

    async _getChapters(manga) {
        let chapterlist = [];
        const uri = new URL('/anime/'+manga.id, this.url);
        const request = new Request(uri, this.requestOptions);
        let data = await this.fetchDOM(request, 'div#app');
        data = JSON.parse(data[0].dataset['page']);
        const pageCount = data.props.episode_list.meta.last_page;
        const version = data.version;
        const token = await this.getToken(uri);

        for(let page = 1; page <= pageCount; page++) {
            const chapters = await this._getchaptersFromPage(manga, page, version, token);
            chapterlist.push(...chapters);
        }
        return chapterlist.reverse();
    }

    async _getchaptersFromPage(manga, page, version, token) {
        const uri = new URL('/anime/'+manga.id, this.url);
        const body = {
            eps_page : page,
            filter : {
                episodes : true,
                specials : true
            }
        };

        const data = await this.fetchFromApi(uri, body, 'AnimeDetail', 'episode_list', version, token);
        return data.props.episode_list.data.map(element => {
            return {
                id: `/anime/${manga.id}/${element.slug}`,
                title: element.slug + ' : '+ element.title.trim()
            };
        });
    }

    async _getPages(chapter) {
        const uri = new URL(chapter.id, this.url);
        const request = new Request(uri, this.requestOptions);
        let data = await this.fetchDOM(request, 'div#app');
        data = JSON.parse(data[0].dataset['page']);
        const version = data.version;

        //Find the slug of the desired video type : SUB or DUB
        let source = this.findPreferedLanguage(data.props.video_list.data);

        //if the desired source (SUB or DUB)is not the one on the page
        if (source.slug != data.props.video.data.slug) {

            //fetch good video source with another api call
            const body = {video : source.slug};
            const token = await this.getToken(uri);
            data = await this.fetchFromApi(uri, body, 'Episode', 'video', version, token);
        }

        source = data.props.video.data;

        //now choose resolution from mirrors
        let video = source.mirror.find(element => element.resolution == this.config.resolution.value);
        video = !video ? source.mirror[0]: video;
        return { video : video.code.file, subtitles : []};

    }

    findPreferedLanguage(data) {
        if (!Array.isArray(data)) return data;
        if (data.length == 1) return data[0];

        let result = undefined;

        if (this.config.format.value == 'SUB') {
            result = data.find(element => element.subtitle.code != 'xx');
        }

        if (this.config.format.value == 'DUB') {
            result = data.find(element => element.subtitle.code == 'xx');
        }

        result = !result ? data[0] : result;
        return result;
    }

    async fetchFromApi(url, body, component, partialdata, version, token) {
        const request = new Request(url, {
            method: 'POST',
            headers: {
                'Accept': 'text/html, application/xhtml+xml',
                'Content-Type': 'application/json',
                'x-origin' : this.url,
                'x-referer' : url.href,
                'X-Inertia' : 'true',
                'X-Inertia-Partial-Component': component, //'AnimeDetail',
                'X-Inertia-Partial-Data': partialdata, //'episode_list',
                'X-Inertia-Version' : version,
                'X-Requested-With' : 'XMLHttpRequest',
                'X-XSRF-TOKEN' : token

            },
            body: JSON.stringify(body)
        });
        const response = await fetch(request);
        return await response.json();
    }

    async getToken(url) {
        //  First fetch token
        const request = new Request(url, this.requestOptions );
        const token = await Engine.Request.fetchUI( request,
            `new Promise( resolve =>
         resolve(document.cookie) 
          )` );
        return decodeURIComponent(token.match(/XSRF-TOKEN=([\S]+)/)[1]);
    }

}
