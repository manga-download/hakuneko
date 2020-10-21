import MH from './templates/MH.mjs';

export default class xianman123 extends MH {

    constructor() {
        super();
        super.id = 'xianman123';
        super.label = 'XianMan123';
        this.tags = [ 'manga', 'webtoon', 'chinese' ];
        this.url = 'https://www.xianman123.com';

        this.path = '/f-1-0-0-0-0-2-%PAGE%.html';
        this.queryMangasPageCount = 'div.page-pagination ul.pagination li:nth-last-child(3) a';
        this.pathMatch = /f-1-0-0-0-0-2-(\d+)/;
        this.queryChapter = 'div#chapterlistload ul#detail-list-select-1 li a';
        this.queryPages = /picdata\s*=\s*(\[[^\]]+\])\s*;/g;
    }

async _getPages(chapter) {
    let request = new Request(new URL(chapter.id, this.url), this.requestOptions);
    let data = await this.fetchRegex(request, this.queryPages);
    let domain = await this.fetchRegex(request, /imgDomain\s*=\s*'([^\']+)\s*'/g);
    console.log(domain[0])
    data = Object.values(JSON.parse(data));
    console.log(data[0])
    return data.map(element => new URL(element, domain[0]).href);
}

}