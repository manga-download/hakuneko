import Connector from '../engine/Connector.mjs';
import Manga from '../engine/Manga.mjs';

export default class ReadM extends Connector {

    constructor() {
        super();
        super.id = 'readm';
        super.label = 'Read M';
        this.tags = [ 'manga', 'english' ];
        this.url = 'https://readm.org';
    }

    async _getMangas() {
        let mangas = [];
        let index = ['', 'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z'];

        for(let letter of index) {
            let url = this.url + '/manga-list/' + letter;

            let request = new Request(url, this.requestOptions);
            let data = await this.fetchDOM(request, '.poster > a');

            for (let manga of data) {
                mangas.push(
                    {
                        id: this.url+manga.pathname,
                        title: manga.querySelectorAll('h2')[0].innerText.trim()
                    }
                );
            }
        }

        return mangas;
    }

    async _getChapters(manga) {
        let chapters = [];

        let request = new Request(manga.id, this.requestOptions);
        let data = await this.fetchDOM(request, '.episodes-list .item');

        for (let chapter of data) {
            chapters.push(
                {
                    id: this.url+chapter.querySelectorAll('#table-episodes-title > h6 > a')[0].pathname,
                    title: chapter.querySelectorAll('#table-episodes-title')[0].innerText.trim(),
                    language: 'en'
                }
            );
        }

        return chapters;
    }

    async _getPages(chapter) {
        let images = [];
        let request = new Request(chapter.id, this.requestOptions);
        let data = await this.fetchDOM(request, '.ch-image-container');

        for ( let image of data[0].querySelectorAll('source') ) {
            images.push(this.url+image.attributes.getNamedItem('src').value);
        }

        return images;
    }

    async _getMangaFromURI(uri) {
        let href;

        if ( uri.href.endsWith('/all-pages') ) {
            href = uri.href.split('/');
            href.pop();
            href.pop();
            href = href.join('/');
        } else {
            href = uri.href;
        }

        let request = new Request(href, this.requestOptions);
        let data = await this.fetchDOM(request, '.page-title');

        return new Manga(this, href, data[0].textContent);
    }

}