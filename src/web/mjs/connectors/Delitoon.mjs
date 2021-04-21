import Connector from '../engine/Connector.mjs';
import Manga from '../engine/Manga.mjs';

export default class Delitoon extends Connector {

    constructor() {
        super();
        super.id = 'delitoon';
        super.label = 'Delitoon';
        this.tags = [ 'webtoon', 'french' ];
        this.url = 'https://www.delitoon.com';
        this.links = {
            login: 'https://www.delitoon.com/connexion'
        };
    }

    async _getMangaFromURI(uri) {
        let request = new Request(uri, this.requestOptions);
        let data = await this.fetchDOM(request, 'div.serie-page div.container div.informations-part1.detail div div.bloc-left h2');
        return new Manga(this, uri.pathname, data[0].textContent.trim());
    }

    async _getMangas() {
        let mangaList = [];
        let genres = ['Romance', 'BL', 'Drama', 'Sentimental', 'Historique', 'Slice%20of%20Life', 'Fantastique', 'Comédie', 'Thriller', 'Action', 'Aventure', 'SF'];
        for(let genre of genres) {
            let mangas = await this._getMangasFromPage(genre);
            mangaList.push(...mangas);
        }
        return mangaList;
    }

    async _getMangasFromPage(page) {
        let request = new Request(this.url + '/genres/' + page, this.requestOptions);
        let data = await this.fetchDOM(request, 'div.genres-page div.content ul li');
        return data.filter(element => element.querySelector('h3'))
            .map(element => {
                let title = element.querySelector('div.container-infos h3').textContent.trim();
                let link = element.querySelector('li a');
                return {
                    id: this.getRootRelativeOrAbsoluteLink(link, request.url),
                    title: title
                };
            });
    }

    async _getChapters(manga) {
        let request = new Request(this.url + manga.id, this.requestOptions);
        let data = await this.fetchDOM(request, 'div.container div.episodes div.title ul#tab1 li');
        return data.filter(element => element.querySelector('div.number'))
            .map(element => {
                let title = element.querySelector('div.container-infos div.bloc-infos div.number').textContent.trim();
                let link = element.querySelector('li a');
                return {
                    id: this.getRootRelativeOrAbsoluteLink(link, request.url),
                    title: 'Episode ' + title
                };
            });
    }

    async _getPages(chapter) {
        let request = new Request(this.url + chapter.id, this.requestOptions);
        let data = await this.fetchDOM(request, 'div.episode div#bck-color div.main div#image-container source');
        return data.map(element => this.getAbsolutePath(element, request.url));
    }
}