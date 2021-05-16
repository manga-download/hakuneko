import Connector from '../engine/Connector.mjs';

export default class UnionMangas extends Connector {

    constructor() {
        super();
        super.id = 'unionmangas';
        super.label = 'UnionMangas';
        this.tags = [ 'manga', 'portuguese' ];
        this.url = 'https://unionmangas.top'; // https://unionleitor.top
        this.links = {
            login: 'https://unionmangas.top/login'
        };
    }

    async _getMangas() {
        let mangaList = [];
        for (let page = 1, run = true; run; page++) {
            const mangas = await this._getMangasFromPage(page);
            mangas.length > 0 ? mangaList.push(...mangas) : run = false;
        }
        return mangaList;
    }

    async _getMangasFromPage(page) {
        const uri = new URL('/mangas/visualizacoes/' + page, this.url);
        const request = new Request(uri, this.requestOptions);
        const data = await this.fetchDOM(request, 'div.tamanho-bloco-perfil div.lista-mangas-novos > a:last-of-type');
        return data.map(element => {
            return {
                id: this.getRootRelativeOrAbsoluteLink(element, this.url),
                title: element.text.trim()
            };
        });
    }

    async _getChapters(manga) {
        const uri = new URL(manga.id, this.url);
        const request = new Request(uri, this.requestOptions);
        const data = await this.fetchDOM(request, 'div.perfil-manga div.capitulos div:first-of-type > a');
        return data.map(element => {
            return {
                id: this.getRootRelativeOrAbsoluteLink(element, this.url),
                title: element.text.trim()
            };
        });
    }

    async _getPages(chapter) {
        const uri = new URL(chapter.id, this.url);
        const request = new Request(uri, this.requestOptions);
        const data = await this.fetchDOM(request, 'source.img-manga');
        return data.map(element => this.getAbsolutePath(element, request.url)).filter(link => !link.includes('banner_'));
    }
}