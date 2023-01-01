import AnyACG from './templates/AnyACG.mjs';
export default class LeerCapitulo extends AnyACG {
    constructor() {
        super();
        super.id = 'leercapitulo';
        super.label = 'LeerCapitulo';
        this.tags = [ 'manga', 'spanish' ];
        this.url = 'https://www.leercapitulo.com';
        this.categories = ['/publicandose/', '/finalizado/', '/pausado/', '/cancelado/'];
        this.path ='/status';
        this.language = 'es';
        this.queryChapters = 'div.chapter-list ul li h4 a';
        this.queryPages = 'div.chapter-content-inner p#arraydata';
    }
    async _getMangas() {
        let mangaList = [];
        for (const cat of this.categories) {
            const uri = new URL(this.path + cat, this.url);
            const request = new Request(uri, this.requestOptions);
            const data = await this.fetchDOM(request, 'ul.pagination li:last-of-type a');
            const pageCount = data.length > 0 ? parseInt(data[0].href.match(/(\d)+$/)[1]) : 1;
            for(let page = 1; page <= pageCount; page++) {
                const mangas = await this._getMangasFromPage(page, cat);
                mangaList.push(...mangas);
            }
        }
        return mangaList;
    }
    async _getMangasFromPage(page, cat) {
        const uri = new URL(this.path + cat+ '?page='+ page, this.url);
        const request = new Request(uri, this.requestOptions);
        const data = await this.fetchDOM(request, 'div.cate-manga div.media-body > a');
        return data.map(element => {
            return {
                id: this.getRootRelativeOrAbsoluteLink(element, this.url),
                title: element.title.trim()
            };
        });
    }
    async _getPages(chapter) {
        let chapters = [];
        for (let i = 1; i <= 3; i++) {
            await this.wait(500);
            try {
                chapters = await super._getPages(chapter);
            } catch(error) {
                //
            }
            if (chapters.length > 0) break;
        }
        return chapters;
    }
}
