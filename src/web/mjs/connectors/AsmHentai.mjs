import Connector from '../engine/Connector.mjs';
import Manga from '../engine/Manga.mjs';

// Similar to HentaiFox
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
                setTimeout(async () => {
                    try {
                        const response = await fetch('/load_thumbs', {
                            method: 'POST',
                            body: JSON.stringify({
                                _token: $('meta[name="csrf-token"]').attr('content'),
                                id: $("#id").val(),
                                dir: $("#dir").val(),
                                v_pages: 0,
                                t_pages: $("#t_pages").val(),
                                type: 2
                            }),
                            headers: {
                                'Content-Type': 'application/json'
                            }
                        });
                        const data = await response.text();
                        const dom = document.createElement('div');
                        dom.innerHTML = data;
                        const images = [...dom.querySelectorAll('div.preview_thumb img.lazy')].map(image => (image.dataset.src || image.src).replace('t.jpg', '.jpg'));
                        resolve(images);
                    } catch(error) {
                        reject(error);
                    }
                }, 1000);
            });
        `;
        const uri = new URL(chapter.id, this.url);
        const request = new Request(uri, this.requestOptions);
        return Engine.Request.fetchUI(request, script);
    }
}