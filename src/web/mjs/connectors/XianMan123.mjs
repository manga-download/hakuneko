import MH from './templates/MH.mjs';

export default class xianman123 extends MH {

    constructor() {
        super();
        super.id = 'xianman123';
        super.label = 'XianMan123';
        this.tags = [ 'manga', 'webtoon', 'chinese' ];
        this.url = 'https://www.xianmanwang.com';

        this.path = '/f-1-0-0-0-0-2-%PAGE%.html';
        this.queryMangasPageCount = 'div.page-pagination ul.pagination li:nth-last-child(3) a';
        this.pathMatch = /f-1-0-0-0-0-2-(\d+)/;
        this.queryChapter = 'div#chapterlistload ul#detail-list-select-1 li a';

        this.requestOptions.headers.set('x-referer', `${this.url}/`);
    }

    async _getPages(chapter) {
        let script = `
            new Promise((resolve, reject) => {
                setTimeout(() => {
                    try {
                        resolve([ picdata, imgDomain ]);
                    } catch(error) {
                        reject(error);
                    }
                }, 2500);
            });
        `;
        const uri = new URL(chapter.id, this.url);
        const request = new Request(uri, this.requestOptions);
        const [ picdata, imgDomain ] = await Engine.Request.fetchUI(request, script);
        return picdata.map(element => this.createConnectorURI(new URL(element, imgDomain).href));
    }
}
