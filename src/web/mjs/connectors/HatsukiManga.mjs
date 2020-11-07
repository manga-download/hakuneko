import Connector from '../engine/Connector.mjs';
import Manga from '../engine/Manga.mjs';

export default class HatsukiManga extends Connector {

    constructor() {
        super();
        super.id = 'hatsukimanga';
        super.label = 'Hatsuki Manga';
        this.tags = [ 'manga', 'webtoon', 'spanish' ];
        this.url = 'https://hatsukimanga.com';
    }

    async _getMangaFromURI(uri) {
        let request = new Request(uri, this.requestOptions);
        let data = await this.fetchDOM(request, 'div.contenedor-titulo h2.titulo-pag-obra');
        let id = uri.pathname + uri.search;
        let title = data[0].textContent.trim();
        return new Manga(this, id, title);
    }

    async _getMangas() {
        const uri = new URL('/biblioteca.php', this.url);
        const request = new Request(uri, this.requestOptions);
        const data = await this.fetchDOM(request, 'main div.miniatura-descripcion p');
        return data.map(element => {
            return {
                id: this.getRootRelativeOrAbsoluteLink(element.closest('a'), this.url),
                title: element.textContent.trim()
            };
        });
    }

    async _getChapters(manga) {
        const uri = new URL(manga.id, this.url);
        const request = new Request(uri, this.requestOptions);
        const data = await this.fetchDOM(request, 'article.lista-capitulos div.cuadro-obra');
        return data.reduce((accumulator, element) => {
            const chapter = element.querySelector('div.capitulo-apartado p.enlace-apartado').textContent.trim();
            const scanlations = [...element.querySelectorAll('ul.lista-de-capitulos li.elemento-capitulo')].map(item => {
                return {
                    id: this.getRootRelativeOrAbsoluteLink(item.querySelector('a.scan-capitulo[href*="viewer?id"]'), request.url),
                    title: `${chapter} [${item.querySelector('a.scan-capitulo[href*="scan?ids"]').text.trim()}]`
                };
            });
            return accumulator.concat(...scanlations);
        }, []);
    }

    async _getPages(chapter) {
        let request = new Request(new URL(chapter.id, this.url), this.requestOptions);
        let data = await this.fetchDOM(request, 'ul.lista-de-paginas li.li-pagina source.imagen-pagina');
        return data.map(element => this.getAbsolutePath(element, request.url)).filter(link => /(.jpg|.png|.webp)$/.test(link));
    }
}