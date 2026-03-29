import WordPressMangastream from './templates/WordPressMangastream.mjs';

export default class FusionScanlation extends WordPressMangastream {

    constructor() {
        super();
        super.id = 'fusionscanlation';
        super.label = 'Fusion Scanlation';
        this.tags = [ 'webtoon', 'spanish' ];
        this.url = 'https://fusionscanlation.com';
        this.path = '/proyectos/page/';

        this.queryMangas = 'div.listupd div.bsx a';
    }

    async _getMangas() {
        let mangaList = [];
        for(let page = 1, run = true; run; page++) {
            let mangas = await this._getMangasFromPage(page);
            mangas.length > 0 ? mangaList.push(...mangas) : run = false;
        }
        return mangaList;
    }

    async _getMangasFromPage(page) {
        const uri = new URL(this.path + page, this.url);
        let request = new Request(uri, this.requestOptions);
        let data = await this.fetchDOM(request, this.queryMangas);
        return data.map(element => {
            return {
                id: this.getRootRelativeOrAbsoluteLink(element, request.url),
                title: element.title.trim()
            };
        });
    }
}