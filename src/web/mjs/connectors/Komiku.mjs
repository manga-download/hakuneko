import Connector from '../engine/Connector.mjs';
import Manga from '../engine/Manga.mjs';

export default class Komiku extends Connector {
    constructor() {
        super();
        super.id = 'komiku';
        super.label = 'Komiku';
        this.tags = ['manga', 'indonesian'];
        this.url = 'https://komiku.id';
        this.paths = ['manga', 'manhua', 'manhwa'];
    }
    async _getMangaFromURI(uri) {
        let request = new Request(uri, this.requestOptions);
        let data = await this.fetchDOM(request, 'article header#Judul h1[itemprop="name"]');
        let id = uri.pathname;
        let title = data[0].textContent.trim();
        return new Manga(this, id, title);
    }

    async _getMangas() {
        //using the genres list because the full list isnt really full
        let mangaList = [];
        for (const genre of this.paths) {
            let request = new Request(new URL('/daftar-komik/?tipe='+genre, this.url), this.requestOptions);
            let data = await this.fetchDOM(request, 'div.ls4 div.ls4j h4 a');
            let mangas = data.map(element => {
                return {
                    id: this.getRootRelativeOrAbsoluteLink(element, this.url),
                    title: element.text.trim()
                };
            });
            mangaList.push(...mangas);
        }
        return mangaList;
    }

    async _getChapters(manga) {
        const uri = new URL(manga.id, this.url);
        const request = new Request(uri, this.requestOptions);
        const data = await this.fetchDOM(request, 'table#Daftar_Chapter td.judulseries a');
        return data.map(element => {
            return {
                id: this.getRootRelativeOrAbsoluteLink(element, this.url),
                title: element.text.replace(manga.title, '').trim()
            };
        });
    }

    async _getPages(chapter) {
        const uri = new URL(chapter.id, this.url);
        const request = new Request(uri, this.requestOptions);
        const data = await this.fetchDOM(request, 'section#Baca_Komik source');
        return data.map(element => this.getAbsolutePath(element.dataset.src || element, this.url));
    }
}
