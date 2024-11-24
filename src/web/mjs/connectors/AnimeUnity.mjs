import Connector from '../engine/Connector.mjs';
import Manga from '../engine/Manga.mjs';
export default class AnimeUnity extends Connector {
    constructor() {
        super();
        super.id = 'animeunity';
        super.label = 'AnimeUnity';
        this.tags = [ 'anime', 'italian' ];
        this.url = 'https://www.animeunity.to';
    }
    async _getMangaFromURI(uri) {
        const request = new Request(uri, this.requestOptions);
        //strip episode part of url (website tends to add it)
        uri = new URL(uri.href.split('/').slice(0, 5).join("/"));
        const data = await this.fetchDOM(request, 'div.general h1.title');
        return new Manga(this, uri.pathname, data[0].textContent.trim());
    }
    async _getMangas() {
        let mangaList = [];
        const token = await this.getToken();
        for (let page = 0, run = true; run; page++) {
            const mangas = await this._getMangasFromPage(page, token);
            mangas.length > 0 ? mangaList.push(...mangas) : run = false;
        }
        return mangaList;
    }
    async _getMangasFromPage(page, token) {
        const uri = new URL('/archivio/get-animes', this.url);
        const body = {
            'title':false,
            'type':false,
            'year':false,
            'order':false,
            'status':false,
            'genres':false,
            'offset':page * 30,
            'dubbed':false,
            'season':false
        };
        const request = new Request(uri, {
            method: 'POST',
            body: JSON.stringify(body),
            headers: {
                'accept': 'application/json, text/plain, */*',
                'content-type': 'application/json, text/plain, */*',
                'x-referer': this.url+ '/archivio',
                'x-origin': this.url,
                'X-Requested-With': 'XMLHttpRequest',
                'X-CSRF-TOKEN': token,
            }
        });
        const response = await fetch(request);
        const data = await response.json();
        return data.records.map(element => {
            return {
                id: '/anime/'+element.id+'-'+element.slug,
                title: element.title_eng.trim()
            };
        });
    }
    async _getChapters(manga) {
        const uri = new URL(manga.id, this.url);
        const request = new Request(uri, this.requestOptions);
        const data = await this.fetchDOM(request, 'video-player');
        const episodes = JSON.parse(data[0].getAttribute('episodes'));
        return episodes.map(element => {
            return {
                id: manga.id +'/'+ element.id,
                title: 'Episode '+ element.number,
            };
        }).reverse();
    }
    async _getPages(chapter) {
        const uri = new URL(chapter.id, this.url);
        const request = new Request(uri, this.requestOptions);
        const data = await this.fetchDOM(request, 'video-player');
        const episode = JSON.parse(data[0].getAttribute('episode'));
        return { video : episode.link };
    }
    async getToken() {
        const request = new Request(this.url, this.requestOptions);
        const data = await this.fetchDOM(request, 'meta[name=csrf-token]');
        return data[0].content;
    }
}
