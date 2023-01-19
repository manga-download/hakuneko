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
        let request = new Request( uri.href, this.requestOptions );
        let token = await Engine.Request.fetchUI( request,
            `new Promise( resolve =>
         resolve(document.cookie) 
          )` );

        token = decodeURIComponent(token.match(/XSRF-TOKEN=([\S]+)/)[1]);

        request = new Request(new URL('/anime/'+manga.id, this.url), this.requestOptions);
        let data = await this.fetchDOM(request, 'div#app');
        data = JSON.parse(data[0].dataset['page']);
        const pageCount = data.props.episode_list.meta.last_page;
        const version = data.version;
        for(let page = 1; page <= pageCount; page++) {
            const chapters = await this._getchaptersFromPage(manga, page, token, version);
            chapterlist.push(...chapters);
        }
        return chapterlist.reverse();
    }

    async _getchaptersFromPage(manga, page, token, version) {
        const uri = new URL('/anime/'+manga.id, this.url);
        const body = {
            eps_page : page,
            filter : {
                episodes : true,
                specials : true
            }
        };

        const request = new Request(uri, {
            method: 'POST',
            headers: {
                'Accept': 'text/html, application/xhtml+xml',
                'Content-Type': 'application/json',
                'x-origin' : this.url,
                'x-referer' : uri.href,
                'X-Inertia' : "true",
                'X-Inertia-Partial-Component': 'AnimeDetail',
                'X-Inertia-Partial-Data':'episode_list',
                'X-Inertia-Version' : version,
                'X-Requested-With' : 'XMLHttpRequest',
                'X-XSRF-TOKEN' : token

            },
            body: JSON.stringify(body)
        });

        const response = await fetch(request);
        const data = await response.json();
        return data.props.episode_list.data.map(element => {
            return {
                id: `/anime/${manga.id}/${element.slug}`,
                title: element.slug + ' : '+ element.title.trim()
            };
        });
    }

    async _getPages(chapter) {

        const request = new Request(new URL(chapter.id, this.url), this.requestOptions);
        let data = await this.fetchDOM(request, 'div#app');
        data = JSON.parse(data[0].dataset['page']);

        let source = this.findPreferedLanguage(data.props.video_list.data);
        let video = source.mirror.find(element => element.resolution == this.config.resolution.value);
        video = !video ? source.mirror[0] : video;
        return { video : video.code.file, subtitles : []};

    }
    findPreferedLanguage(data) {
        if (data.length == 1) return data[0];

        if (this.config.format.value == 'SUB') {
            return data.find(element => element.subtitle.code != 'xx');
        }

        if (this.config.format.value == 'DUB') {
            return data.find(element => element.subtitle.code == 'xx');
        }
        return data[0];

    }
}
