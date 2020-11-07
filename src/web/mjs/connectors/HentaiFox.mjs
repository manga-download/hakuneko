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
                setTimeout(async () => {
                    try {
                        const response = await fetch('/includes/thumbs_loader.php', {
                            method: 'POST',
                            body: new URLSearchParams({
                                u_id: $('#gallery_id').val(),
                                g_id: $('#load_id').val(),
                                img_dir: $('#load_dir').val(),
                                visible_pages: 0,
                                total_pages: $('#load_pages').val(),
                                type: 2
                            }).toString(),
                            headers: {
                                'Content-Type': 'application/x-www-form-urlencoded',
                                'X-Requested-With': 'XMLHttpRequest'
                            }
                        });
                        const data = await response.text();
                        const dom = document.createElement('div');
                        dom.innerHTML = data;
                        const images = [...dom.querySelectorAll('div.g_thumb img.lazy')].map(image => (image.dataset.src || image.src).replace('t.jpg', '.jpg'));
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