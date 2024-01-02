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

    canHandleURI(uri) {
        return /https?:\/\/piccoma\.com\/fr/.test(uri);
    }

    async _getMangaFromURI(uri) {
        const id = uri.pathname;
        const request = new Request(uri, this.requestOptions);
        const data = await this._getNextData(request);
        const title = data.props.pageProps.initialState.productHome.productHome.product.title;
        return new Manga(this, id, title);
    }

    async _getMangas() {
        let msg = 'This website does not provide a manga list, please copy and paste the URL containing the chapters directly from your browser into HakuNeko.';
        throw new Error(msg);
    }

    async _getChapters(manga) {
        const type = manga.id.split('/').slice(-2)[0];
        const productId = manga.id.split('/').pop();
        const path = type == 'product' ? `/fr/product/episode/${productId}` : manga.id;
        const uri = new URL(path, this.url);
        const request = new Request(uri, this.requestOptions);
        const nextData = await this._getNextData(request);
        const episodes = nextData.props.pageProps.initialState.episode.episodeList.episode_list;
        return episodes.map(ep => {
            return {
                id: `${nextData.buildId}/fr/viewer/${productId}/${ep.id}`,
                title: ep.title,
            };
        }).reverse();
    }

    async _getPages(chapter) {
        const result = await this._fetchChapterNextData(chapter);
        if (!result.pageProps.initialState) {
            throw new Error(`The chapter '${chapter.title}' is neither public, nor purchased!`);
        }

        const pdata = result.pageProps.initialState.viewer.pData;
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

    async _getNextData(request) {
        const [data] = await this.fetchDOM(request, '#__NEXT_DATA__');
        return JSON.parse(data.textContent);
    }

    async _fetchChapterNextData(chapter) {
        const parts = chapter.id.split('/');
        const productId = parts[3];
        const episodeId = parts[4];
        const uri = new URL(`fr/_next/data/${chapter.id}.json`, this.url);
        uri.searchParams.set('productId', productId);
        uri.searchParams.set('episodeId', episodeId);
        const request = new Request(uri, this.requestOptions);
        try {
            return await this.fetchJSON(request);
        } catch (error) {
            console.error(error);
            throw new Error(`The chapter '${chapter.title}' is neither public, nor purchased!`);
        }
    }
}