import Connector from '../engine/Connector.mjs';
import Manga from '../engine/Manga.mjs';

// Similar to AsmHentai, HentaiFox
export default class IMHentai extends Connector {

    constructor() {
        super();
        super.id = 'imhentai';
        super.label = 'IMHentai';
        this.tags = [ 'hentai', 'english' ];
        this.url = 'https://imhentai.xxx';
    }

    async _getMangaFromURI(uri) {
        let request = new Request(uri, this.requestOptions);
        let data = await this.fetchDOM(request, 'div.right_details h1', 3);
        let id = uri.pathname;
        let title = data[0].textContent.trim();
        return new Manga(this, id, title);
    }

    async _getMangas() {
        let msg = 'This website provides a manga list that is to large to scrape, please copy and paste the URL containing the images directly from your browser into HakuNeko.';
        throw new Error(msg);
    }

    async _getChapters(manga) {
        return [ { ...manga, language: '' } ];
    }

    async _getPages(chapter) {
        const script = `
            new Promise((resolve, reject) => {
                setTimeout(() => {
                    try {
                        const extensions = [ '.jpg', '.png', '.gif', '.webp' ];
                        const server = $('#load_server').val();
                        const dir = $('#load_dir').val();
                        const id = $('#load_id').val();
                        const images = Object.values(g_th).map((item, index) => {
                            const file = (index + 1) + extensions.find(ext => ext[1] === item[0]);
                            return [ 'https://m' + server + '.' + window.location.hostname, dir, id, file ].join('/');
                        });
                        resolve(images);
                    } catch(error) {
                        reject(error);
                    }
                }, 2500);
            });
        `;
        const uri = new URL(chapter.id, this.url);
        const request = new Request(uri, this.requestOptions);
        const data = await Engine.Request.fetchUI(request, script);
        return data.map(link => {
            const payload = {
                url: link,
                referer: request.url
            };
            return this.createConnectorURI(payload);
        });
    }

    async _handleConnectorURI(payload) {
        let request = new Request(payload.url, this.requestOptions);
        request.headers.set('x-referer', payload.referer);
        let response = await fetch(request);
        let data = await response.blob();
        return this._blobToBuffer(data);
    }
}