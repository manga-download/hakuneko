import WordPressMadara from './templates/WordPressMadara.mjs';

export default class Toonily extends WordPressMadara {

    constructor() {
        super();
        super.id = 'toonily';
        super.label = 'Toonily';
        this.tags = [ 'webtoon', 'hentai', 'english' ];
        this.url = 'https://toonily.com';
        this.requestOptions.headers.set('x-cookie', 'wpmanga-adault=1');
    }

    async _getMangas() {
        let mangaList = [];
        let request = new Request(this.url + this.path, this.requestOptions);
        let data = await this.fetchDOM(request, 'div.wp-pagenavi > a.last');
        let pageCount = parseInt(data[0].href.match(/(\d+)\/?$/)[1]);
        for(let page = 1; page <= pageCount; page++) {
            let mangas = await this._getMangasFromPage(page);
            mangaList.push(...mangas);
        }
        return mangaList;
    }

    async _getMangasFromPage(page) {
        const uri = new URL(`/page/${page}/`, this.url);
        const request = new Request(uri, this.requestOptions);
        const data = await this.fetchDOM(request, this.queryMangas);
        return data.map(element => {
            return {
                id: this.getRootRelativeOrAbsoluteLink(element, this.url),
                title: element.text.trim()
            };
        });
    }
}