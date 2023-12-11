import Piccoma from './Piccoma.mjs';
import Manga from '../engine/Manga.mjs';

export default class PiccomaFR extends Piccoma {

    constructor() {
        super();
        super.id = 'piccoma-fr';
        super.label = 'Piccoma (French)';
        this.tags = ['manga', 'webtoon', 'french'];
        this.url = 'https://piccoma.com/fr';
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

    async _getPages(chapter) {

        const script = `
    	      new Promise((resolve, reject) => {

    	          function _getSeed(url) {
                    const uri = new URL(url);
                    let checksum = uri.searchParams.get('q');
                    const expires = uri.searchParams.get('expires');
                    const total = expires.split('').reduce((total, num2) => total + parseInt(num2), 0);
                    const ch = total % checksum.length;
                    checksum = checksum.slice(ch * -1) + checksum.slice(0, ch * -1);
                    return globalThis.dd(checksum);
                }
                
                try {
                    const pdata = __NEXT_DATA__.props.pageProps.initialState.viewer.pData;
                    if (!pdata) reject();
                    if (!pdata.img) reject(); 
                    
                    const images = pdata.img
                        .filter(img => !!img.path)
                        .map(img => {
                            	return {
                            	    url : img.path,
                            	    key : pdata.isScrambled ? _getSeed(img.path) : null,
                            	}
                        });
                     resolve(images);
                }
                catch (error) {
                }
                reject();
      	    });
      	`;

        const request = new Request(`${this.url}/viewer/${chapter.manga.id}/${chapter.id}`, this.requestOptions);
        const images = await Engine.Request.fetchUI(request, script, 10000);
        if (!images) {
            throw new Error(`The chapter '${chapter.title}' is neither public, nor purchased!`);
        }
        return images.map(image => this.createConnectorURI({...image}));

    }
}