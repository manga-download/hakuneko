import Connector from '../engine/Connector.mjs';
import Manga from '../engine/Manga.mjs';

export default class UnionMangas extends Connector {

    constructor() {
        super();
        super.id = 'unionmangas';
        super.label = 'UnionMangas';
        this.tags = [ 'manga', 'portuguese' ];
        this.url = 'https://unionmangasbr.top';
        this.links = {
            login: 'https://unionmangasbr.top/login'
        };
    }

    async _getMangaFromURI(uri) {
        const request = new Request(uri, this.requestOptions);
        const data = await this.fetchDOM(request, 'head title');
        const id = uri.pathname;
        const title = data[0].text.split(' - ')[0].trim();
        return new Manga(this, id, title);
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
        const uri = new URL('/lista-mangas/visualizacoes/' + page, this.url);
        const request = new Request(uri, this.requestOptions);
        const data = await this.fetchDOM(request, 'div.tamanho-bloco-perfil div.lista-itens > a:last-of-type', 3);
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
        const data = await this.fetchDOM(request, 'div div.capitulos div:first-of-type > a');
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
        request.headers.set('x-cookie', `modoLeitura=2; path=${chapter.manga.id}` ); //in case cookie is needed to get all pictures
        const data = await this.fetchDOM(request, 'source.img-responsive');
        return data.map(element => this.getAbsolutePath(element, request.url)).filter(link => !link.includes('banner_'));
    }
}
