import Connector from '../engine/Connector.mjs';
import Manga from '../engine/Manga.mjs';

export default class NHentai extends Connector {

    constructor() {
        super();
        super.id = 'nhentai';
        super.label = 'NHentai';
        this.tags = [ 'hentai' ];
        this.url = 'https://nhentai.net';
        this.links = {
            login: 'https://nhentai.net/login/'
        };
    }

    async _getMangaFromURI(uri) {
        const request = new Request(uri, this.requestOptions);
        const data = await this.fetchDOM(request, 'div#info-block div#info h1');
        const id = uri.pathname + uri.search;
        const title = data[0].innerText.trim();
        return new Manga( this, id, title);
    }

    async _getMangas() {
        const msg = 'This website does not provide a manga list, please copy and paste the URL containing the images directly from your browser into HakuNeko.';
        throw new Error(msg);
    }

    async _getChapters(manga) {
        return [ Object.assign({ language: '' }, manga) ];
    }

    async _getPages(chapter) {
        const request = new Request( this.url + chapter.id, this.requestOptions );
        const script = `
            new Promise ( resolve => {
                resolve(_gallery.images.pages.map( (image, index) => {
                    const extension = image.t === 'p' ? '.png' : image.t === 'j' ? '.jpg' : '.gif';
                    const url = 'https://i.nhentai.net/galleries/'+_gallery.media_id + '/' + (index+1)+extension;
                    return _n_app.get_cdn_url(url);
                }));
            })
        `;
        return Engine.Request.fetchUI(request, script);
    }
}
