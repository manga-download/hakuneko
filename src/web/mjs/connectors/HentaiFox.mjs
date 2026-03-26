import Connector from '../engine/Connector.mjs';
import Manga from '../engine/Manga.mjs';

// Similar to AsmHentai, IMHentai
export default class HentaiFox extends Connector {

    constructor() {
        super();
        super.id = 'hentaifox';
        super.label = 'HentaiFox';
        this.tags = [ 'hentai', 'english' ];
        this.url = 'https://hentaifox.com';
    }

    async _getMangaFromURI(uri) {
        let request = new Request(uri, this.requestOptions);
        let data = await this.fetchDOM(request, 'div.gallery_right div.info h1', 3);
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
                        const dir = $('#load_dir').val();
                        const id = $('#load_id').val();
                        const images = Object.values(g_th).map((item, index) => {
                            const file = (index + 1) + (item.startsWith('j') ? '.jpg' : '.png');
                            return [ 'https://i.hentaifox.com', dir, id, file ].join('/');
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
        return Engine.Request.fetchUI(request, script);
    }
}