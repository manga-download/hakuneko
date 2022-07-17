import Piccoma from './Piccoma.mjs';
import Manga from '../engine/Manga.mjs';

export default class PiccomaFR extends Piccoma {

    constructor() {
        super();
        super.id = 'piccoma-fr';
        super.label = 'Piccoma (French)';
        this.tags = ['webtoon', 'french'];
        this.url = 'https://fr.piccoma.com/fr';
    }

    async _getMangaFromURI(uri) {
        const id = uri.pathname.split('/').pop();
        const request = new Request(uri);
        const title = await Engine.Request.fetchUI(request, 'window.__NEXT_DATA__.props.pageProps.initialState.productDetail.productDetail.product.title');
        return new Manga(this, id, title);
    }

    async _getMangas() {
        let msg = 'This website does not provide a manga list, please copy and paste the URL containing the chapters directly from your browser into HakuNeko.';
        throw new Error(msg);
    }

    async _getChapters(manga) {
        const request = new Request(`${this.url}/product/episode/${manga.id}`);
        const episodes = await Engine.Request.fetchUI(request, 'window.__NEXT_DATA__.props.pageProps.initialState.episode.episodeList.episode_list');
        return episodes.map(ep => {
            return {
                id: `${manga.id}/${ep.id}`,
                title: ep.title,
            };
        });
    }

    async _getPages(chapter) {
        const request = new Request(`${this.url}/viewer/${chapter.id}`);
        const pdata = await Engine.Request.fetchUI(request, 'window.__NEXT_DATA__.props.pageProps.initialState.viewer.pData || {}');
        const images = pdata.img;
        if (images == null) {
            throw new Error(`The chapter '${chapter.title}' is neither public, nor purchased!`);
        }
        return images
            .filter(img => !!img.path)
            .map(img => {
                return this.createConnectorURI({
                    url: img.path,
                    key: this._getSeed(img.path),
                    pdata
                });
            });
    }

    _getSeed(url) {
        const uri = new URL(url);
        const checksum = uri.searchParams.get('q');
        const expires = uri.searchParams.get('expires');
        const total = expires.split('').reduce((total, num2) => total + parseInt(num2), 0);
        const ch = total % checksum.length;
        return checksum.slice(ch * -1) + checksum.slice(0, ch * -1);
    }
}