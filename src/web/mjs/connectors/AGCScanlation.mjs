import Connector from '../engine/Connector.mjs';
import Manga from '../engine/Manga.mjs';

export default class AGCScanlation extends Connector {

    constructor() {
        super();
        super.id = 'agcscanlation';
        super.label = 'AGCScanlation';
        this.tags = [ 'manga', 'italian', 'scanlation' ];
        this.url = 'https://www.agcscanlation.it';
    }

    async _getMangaFromURI(uri) {
        const request = new Request(uri, this.requestOptions);
        const id = uri.pathname + uri.search;
        const title = (await this.fetchDOM(request, '.nomeserie span'))[0].textContent.trim();
        return new Manga(this, id, title);
    }

    async _getMangas() {
        const uri = new URL('/serie.php', this.url);
        const request = new Request(uri, this.requestOptions);
        const data = await this.fetchDOM(request, 'div.containerprogetti > div.manga > a');
        return data.map(element => {
            return {
                id: this.getRootRelativeOrAbsoluteLink(element, this.url),
                title: element.querySelector('.nomeserie span').textContent.trim()
            };
        });
    }

    async _getChapters(manga) {
        const uri = new URL(manga.id, this.url);
        const request = new Request(uri, this.requestOptions);
        const data = await this.fetchDOM(request, 'div.capitoli_cont > a');
        return data.map(element => {
            return {
                id: this.getRootRelativeOrAbsoluteLink(element, this.url).replace('reader.php', 'readerr.php'),
                title: element.textContent.trim(),
                language: '',
            };
        }).reverse();
    }

    async _getPages(chapter) {
        const uri = new URL(chapter.id, this.url);
        const request = new Request(uri, this.requestOptions);
        const data = await this.fetchDOM(request, 'div.centrailcorrente > source');
        return data.map(element => this.url + new URL(element.src).pathname);
    }
}