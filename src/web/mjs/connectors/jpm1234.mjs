import SinMH from './templates/SinMH.mjs';
export default class jpm1234 extends SinMH {
    constructor() {
        super();
        super.id = 'jpm1234';
        super.label = 'jpm1234';
        this.tags = [ 'manga','webtoon','chinese' ];
        this.url = 'http://jpm1234.com';
        this.requestOptions.headers.set('x-referer', this.url);

        this.path = '/All/';
        this.pathMatch = '/All/0/0/0/0/0/lastpost/p/(\\d+)/'
        this.queryMangasPageCount = '#last_page';
        this.queryChapters = 'div.chapter-list ul li a';

        this.scriptPages =`
            new Promise(resolve => resolve(cInfo.fs.map(img => 'http://' + pageConfig.host.auto + img)));   
        `;
    }
    async _getMangasFromPage(page) {
        let request = new Request(this.url + this.pathMatch.replace('(\\d+)', page), this.requestOptions);
        let data = await this.fetchDOM(request, this.queryMangas , 3);
        return data.filter(datt => datt.href != "hakuneko:").map(element => {
            return {
                id: this.getRootRelativeOrAbsoluteLink(element, request.url),
                title: element.text.trim()
            };
        });
    }
}