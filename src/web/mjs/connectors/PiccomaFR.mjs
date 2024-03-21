import Piccoma from './Piccoma.mjs';
import Manga from '../engine/Manga.mjs';

export default class PiccomaFR extends Piccoma {

    constructor() {
        super();
        super.id = 'piccoma-fr';
        super.label = 'Piccoma (French)';
        this.tags = ['manga', 'webtoon', 'french'];
        this.url = 'https://piccoma.com/fr';
        this.viewer = '/viewer/';
        this.requestOptions.headers.set('x-referer', 'https://piccoma.com/fr');
    }

    getAPI(endpoint) {
        return new URL(this.url + '/api/haribo/api/public/v2' + endpoint);
    }

    canHandleURI(uri) {
        return new RegExp('^https://(fr\\.)?piccoma.com/fr/product(/episode)?/\\d+$').test(uri);
    }

    async _getMangaFromURI(uri) {
        const id = uri.split('/').pop();
        const request = new Request(`${this.url}/product/${id}`, this.requestOptions);
        const [ element ] = await this.fetchDOM(request, 'meta[property="og:title"]');
        return new Manga(this, id, element.content.split('|').shift().trim());
    }

    async _getMangas() {
        const mangaList = [];
        const vowels = 'aeiou'.split('');
        for (const word of vowels) {
            for (let page = 1, run = true; run; page++) {
                const mangas = await this.getMangasFromPage(word, page);
                mangas.length > 0 ? mangaList.push(...mangas) : run = false;
            }
        }
        return [...new Set(mangaList.map(manga => manga.id))].map(id => mangaList.find(manga => manga.id === id));
    }

    async getMangasFromPage(word, page) {
        const uri = this.getAPI('/search/product');
        uri.searchParams.set('search_type', 'P');
        uri.searchParams.set('word', word);
        uri.searchParams.set('page', `${page}`);
        const { data: { p_products: entries } } = await this.fetchJSON(new Request(uri, this.requestOptions));
        return entries.map(entry => {
            return {
                id: entry.product_id,
                title: entry.title,
            };
        });
    }

    async _getChapters(manga) {
        const request = new Request(`${this.url}/product/episode/${manga.id}`, this.requestOptions);
        const [ { text: json } ] = await this.fetchDOM(request, 'script#__NEXT_DATA__');
        const chapters = JSON.parse(json).props.pageProps.initialState.episode.episodeList.episode_list;
        return chapters.map(chapter => {
            return {
                id: chapter.id,
                title: chapter.title
            };
        });
    }

}