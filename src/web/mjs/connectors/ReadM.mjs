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
            let request = new Request(new URL('/manga-list/' + letter, this.url), this.requestOptions);
            let data = await this.fetchDOM(request, '.poster > a');

            for (let manga of data) {
                mangas.push(
                    {
                        id: manga.pathname,
                        title: manga.querySelector('h2').innerText.trim()
                    }
                );
            }
        }

        return mangas;
    }

    async _getChapters(manga) {
        let chapters = [];

        let request = new Request(new URL(manga.id, this.url), this.requestOptions);
        let data = await this.fetchDOM(request, '.episodes-list .item');

        for (let chapter of data) {
            chapters.push(
                {
                    id: chapter.querySelector('#table-episodes-title > h6 > a').pathname,
                    title: chapter.querySelector('#table-episodes-title').innerText.trim(),
                    language: 'en'
                }
            );
        }

        return chapters;
    }

    async _getPages(chapter) {
        let images = [];
        let request = new Request(new URL(chapter.id, this.url), this.requestOptions);
        let data = await this.fetchDOM(request, '.ch-image-container');

        for ( let image of data[0].querySelectorAll('source') ) {
            images.push(this.getAbsolutePath(image.attributes.getNamedItem('src').value, this.url));
        }

        return images;
    }

    async _getMangaFromURI(uri) {
        if ( uri.href.endsWith('/all-pages') ) {
            uri.href = uri.href.split('/').slice(0, -2).join('/');
        }

        let request = new Request(new URL(uri.href), this.requestOptions);
        let data = await this.fetchDOM(request, '.page-title');

        return new Manga(this, this.getRootRelativeOrAbsoluteLink(uri, this.url), data[0].textContent);
    }

}