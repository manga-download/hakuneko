import Connector from '../engine/Connector.mjs';
import Manga from '../engine/Manga.mjs';

export default class BilibiliAnime extends Connector {

    constructor() {
        super();
        super.id = 'bilibili-anime';
        super.label = '哔哩哔哩 动画区 (Bilibili Anime)';
        this.tags = [ 'anime', 'donghua', 'chinese' ];
        this.url = 'https://www.bilibili.com';
        this.api = 'https://api.bilibili.com';
    }

    async _getMangaFromURI(uri) {
        const request = new Request(uri, this.requestOptions);
        const data = await this.fetchDOM(request, 'meta[property="og:title"]');
        return new Manga(this, uri.pathname, data[0].content.trim());
    }

    // https://www.bilibili.com/v/douga/

    // Must overwrite the method to extract the manga list from the website
    async _getMangas() {
        const uri = new URL('/manga-list', this.url);
        const request = new Request(uri, this.requestOptions);
        const data = await this.fetchDOM(request, 'div.mangas > a');
        return data.map(element => {
            return {
                id: this.getRootRelativeOrAbsoluteLink(element, this.url),
                title: element.text.trim()
            };
        });
    }

    // A variation that will iterate through a multi-page manga list (with abort condition)
    /*
    async _getMangas() {
        let mangaList = [];
        for (let page = 1, run = true; run; page++) {
            const mangas = await this._getMangasFromPage(page);
            mangas.length > 0 ? mangaList.push(...mangas) : run = false;
        }
        return mangaList;
    }
    */

    // A variation that will iterate through a multi-page manga list (with page number limit)
    /*
    async _getMangas() {
        let mangaList = [];
        const uri = new URL('/manga-list', this.url);
        const request = new Request(uri, this.requestOptions);
        const data = await this.fetchDOM(request, 'ul.pagination li:last-of-type a');
        const pageCount = parseInt(data[0].href.match(/(\d)+$/)[1]);
        for(let page = 1; page <= pageCount; page++) {
            const mangas = await this._getMangasFromPage(page);
            mangaList.push(...mangas);
        }
        return mangaList;
    }
    */

    // A private method that may be used for multi-page manga list scraping
    /*
    async _getMangasFromPage(page) {
        const uri = new URL('/manga-list/' + page, this.url);
        const request = new Request(uri, this.requestOptions);
        const data = await this.fetchDOM(request, 'div.mangas > a');
        return data.map(element => {
            return {
                id: this.getRootRelativeOrAbsoluteLink(element, this.url),
                title: element.text.trim()
            };
        });
    }
    */

    // Must overwrite the method to extract the chapter list from the website
    async _getChapters(manga) {
        /*
        const uri = new URL(manga.id, this.url);
        const request = new Request(uri, this.requestOptions);
        const data = await this.fetchDOM(request, 'div.chapters > a');
        return data.map(element => {
            return {
                id: this.getRootRelativeOrAbsoluteLink(element, this.url),
                title: element.text.trim()
            };
        });
        */
        // Anime: https://www.bilibili.com/bangumi/media/md28223058
        // => window.__INITIAL_STATE__.mediaInfo.season_id
        // => https://api.bilibili.com/pgc/web/season/section?season_id=28762
        const uri = new URL('https://api.bilibili.com/pgc/web/season/section?season_id=28762');
        const request = new Request(uri.href, {});
        const response = await fetch(request);
        const data = await response.json();
        const episodes = data.result.main_section.episodes.map(episode => {
            return {
                id: episode.id + '|' + episode.share_url,
                title: episode.title + ' - ' + episode.long_title
            };
        });
        console.log('EPISODES:', episodes);
    }

    async _getPages(chapter) {
        //const uri = new URL('https://www.bilibili.com/bangumi/play/ep' + chapter.id);
        const uri = new URL('/pgc/player/web/playurl', this.api);
        uri.searchParams.set('ep_id', chapter.id);
        uri.searchParams.set('fnval', 80);
        uri.searchParams.set('fnver', 0);
        uri.searchParams.set('fourk', 1);
        const request = new Request(uri.href, {});
        const response = await fetch(request);
        const data = await response.text();
        const dom = new DOMParser().parseFromString(data, 'text/html');
        const rgx = /window.__playinfo__\s*=/gi;
        const script = [...dom.body.querySelectorAll('script')].find(script => rgx.test(script.text)).text.replace(rgx, '');
        const info = JSON.parse(script);
        const videos = info.data.dash.video.map(stream => {
            return {
                height: stream.height,
                codecs: stream.codecs,
                bandwidth: stream.bandwidth,
                url: stream.base_url
            };
        });
        console.log('VIDEO STREAMS:', videos);
        const audios = info.data.dash.audio.map(stream => {
            return {
                codecs: stream.codecs,
                bandwidth: stream.bandwidth,
                baseUrl: stream.baseUrl
            };
        });
        console.log('AUDIO STREAMS:', audios);
    }
}