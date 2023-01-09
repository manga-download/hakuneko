import Connector from '../engine/Connector.mjs';
import Manga from '../engine/Manga.mjs';
export default class TaoSect extends Connector {
    constructor() {
        super();
        super.id = 'taosect';
        super.label = 'Tao Sect';
        this.tags = [ 'manga', 'portuguese', 'webtoon', 'scanlation' ];
        this.url = 'https://taosect.com';
        this.paths = ['ativos', 'finalizados', 'oneshots', 'cancelados'];
    }
    async _getMangaFromURI(uri) {
        const request = new Request(uri, this.requestOptions);
        const data = await this.fetchDOM(request, 'h1.titulo-projeto');
        const id = uri.pathname;
        const title = data[0].textContent.trim();
        return new Manga(this, id, title);
    }
    async _getMangas() {
        let mangaList = [];
        for (let path of this.paths) {
            let request = new Request(new URL('/situacao/'+path, this.url), this.requestOptions);
            let [data] = await this.fetchDOM(request, 'div.post-list');
            let articles = data.querySelectorAll('article.post-projeto a');
            let popups = data.querySelectorAll('div.webui-popover-content.popover-projeto');
            let mangas =[];
            for (let j = 0; j < articles.length; j++) {
                mangas.push({
                    id : this.getRootRelativeOrAbsoluteLink(articles[j], this.url),
                    title : popups[j].querySelector('h3.titulo-popover').textContent.trim()
                });
            }
            mangaList.push(...mangas);
        }
        return mangaList;
    }
    async _getChapters(manga) {
        const request = new Request(new URL(manga.id, this.url), this.requestOptions);
        const data = await this.fetchDOM(request, 'div.volumes_capitulos a:not([class])');
        return data.map(element => {
            return {
                id: this.getRootRelativeOrAbsoluteLink(element, this.url),
                title: element.text.trim(),
            };
        }).reverse();
    }
    async _getPages(chapter) {
        let pagelist = [];
        const request = new Request(new URL(chapter.id, this.url), this.requestOptions);
        const [data] = await this.fetchDOM(request, 'select#leitor_pagina_projeto');
        data.querySelectorAll('option').forEach(element =>{
            pagelist.push(element.value);
        });
        return pagelist;
    }
}
