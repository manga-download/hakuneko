import Connector from '../engine/Connector.mjs';
import Manga from '../engine/Manga.mjs';

// Similar to HentaiFox, IMHentai
export default class AsmHentai extends Connector {

    constructor() {
        super();
        super.id = 'asmhentai';
        super.label = 'AsmHentai';
        this.tags = [ 'hentai', 'multi-lingual' ];
        this.url = 'https://asmhentai.com';
    }

    async _getMangaFromURI(uri) {
        let request = new Request(uri, this.requestOptions);
        let data = await this.fetchDOM(request, 'div.book_page div.info h1', 3);
        let id = uri.pathname;
        let element = data[0];
        this.cfMailDecrypt(element);
        let title = element.textContent.trim();
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
                        const pages = parseInt($("#t_pages").val());
                        const dir = $("#load_dir").val();
                        const id = $("#load_id").val();
                        const images = [...new Array(pages)].map((_, index) => {
                            const file = (index + 1) + '.jpg';
                            return [ 'https://images.asmhentai.com', dir, id, file ].join('/');
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
