import Connector from '../engine/Connector.mjs';
import Manga from '../engine/Manga.mjs';
export default class INKR extends Connector {
    constructor() {
        super();
        super.id = 'inkr';
        super.label = 'INKR';
        this.tags = [ 'manga', 'english' ];
        this.url = 'https://comics.inkr.com';
    }
    async _getMangaFromURI(uri) {
        const id = uri.pathname;
        const request = new Request(uri, this.requestOptions);
        let data = await this._getNextData(request);
        data = LZString.decompressBase64(data.props.pageProps._c);
        
        const title = data.props.pageProps.initialState.productHome.productHome.product.title;
        return new Manga(this, id, title);
    }
    async _getMangas() {
        let msg = 'This website does not provide a manga list, please copy and paste the URL containing the chapters directly from your browser into HakuNeko.';
        throw new Error(msg);
    }
    async _getChapters(manga) {
        const uri = new URL(manga.id, this.url);
        const request = new Request(uri, this.requestOptions);
        const nextData = await this._getNextData(request);
        const episodes = nextData.props.pageProps.initialState.productHome.productHome.episode_list;
        const productId = manga.id.split('/').pop();
        return episodes.map(ep => {
            return {
                id: `${
                nextData.buildId}
                /fr/viewer/${
                productId}
                /${
                ep.id}
                `,
                title: ep.title,
            };
        })
        .reverse();
    }
    async _getPages(chapter) {
        const result = await this._fetchChapterNextData(chapter);
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
                //key: this._getSeed(img.path),
                pdata
            });
        });
    }
    
    /************
    * NEXT
    *************/    
    async _getNextData(request) {
        const [data] = await this.fetchDOM(request, '#__NEXT_DATA__');
        return JSON.parse(data.textContent);
    }
    async _fetchChapterNextData(chapter) {
        const parts = chapter.id.split('/');
        const productId = parts[3];
        const episodeId = parts[4];
        const uri = new URL(`_next/data/${chapter.id}.json`, this.url);
        const request = new Request(uri, this.requestOptions);
        try {
            return await this.fetchJSON(request);
        }
        catch (error) {
            console.error(error);
            throw new Error(`The chapter '${chapter.title}' is neither public, nor purchased!`);
        }
    }


}