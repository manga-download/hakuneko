import Connector from '../engine/Connector.mjs';
import Manga from '../engine/Manga.mjs';

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
        let msg = 'This website does not provide a manga list, please copy and paste the URL containing the images directly from your browser into HakuNeko.';
        throw new Error(msg);
    }

    async _getChapters(manga) {
        return [ { ...manga, language: '' } ];
    }

    async _getPages(chapter) {
        let request = new Request(new URL(chapter.id, this.url), this.requestOptions);
        let data = await this.fetchDOM(request, 'div.gallery source.lazy');
        return data.map(element => this.getAbsolutePath(element.dataset.src.replace('t.jpg', '.jpg'), request.url));
    }
}