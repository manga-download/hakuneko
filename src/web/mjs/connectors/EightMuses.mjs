import Connector from '../engine/Connector.mjs';
import Manga from '../engine/Manga.mjs';

export default class EightMuses extends Connector {

    constructor() {
        super();
        super.id = '8muses';
        super.label = '8 MUSES';
        this.tags = [ 'hentai', 'porn', 'english' ];
        this.url = 'https://comics.8muses.com';
    }

    async _getMangaFromURI(uri) {
        let request = new Request(uri, this.requestOptions);
        let data = await this.fetchDOM(request, 'div#top-menu div.top-menu-breadcrumb ol li:nth-of-type(2) a', 3);
        let id = uri.pathname;
        let title = data[0].text.trim();
        return new Manga(this, id, title);
    }

    async _getMangas() {
        let msg = 'This website does not provide a manga list, please copy and paste the URL containing the images directly from your browser into HakuNeko.';
        throw new Error(msg);
    }

    async _getChapters(manga) {
        let request = new Request(new URL(manga.id, this.url), this.requestOptions);
        let data = await this.fetchDOM(request, 'div#content div div.gallery a[title]');
        return data.map(element => {
            return {
                id: this.getRootRelativeOrAbsoluteLink(element, this.url),
                title: element.text.trim(),
                language: ''
            };
        });
    }

    async _getPages(chapter) {
        let request = new Request(new URL(chapter.id, this.url), this.requestOptions);
        let data = await this.fetchDOM(request, 'div.gallery div.image source.lazyload');
        return data.map(element => this.url + element.dataset['src'].replace('/th/', '/fl/'));
    }
}
