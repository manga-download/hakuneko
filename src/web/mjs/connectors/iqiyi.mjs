import MH from './templates/MH.mjs';

export default class iqiyi extends MH {

    constructor() {
        super();
        super.id = 'iqiyi';
        super.label = 'iqiyi';
        this.tags = [ 'manga', 'webtoon', 'chinese' ];
        this.url = 'https://www.iqiyi.com';

        this.path = '/manhua/category/%E5%85%A8%E9%83%A8_0_9_%PAGE%';
        this.queryMangasPageCount = 'div.mod-page a:nth-last-child(2)';
        this.pathMatch = /_0_9_(\d+)/;
        this.queryMangas = 'ul.cartoon-hot-ul li.cartoon-hot-list a.cartoon-cover';
        this.queryChapter = 'div.chapter-container ol.chapter-fixhei li a';
        this.queryPages = 'ul.main-container li.main-item source';

    }

    async _getChapters(manga) {
        let request = new Request(new URL(manga.id, this.url), this.requestOptions);
        let data = await this.fetchDOM(request, this.queryChapter);
        return data.map(element => {
            return {
                id: this.getRootRelativeOrAbsoluteLink(element.pathname, this.url),
                title: element.text.trim()
            };
        });
    }

    async _getMangasFromPage(page) {
        let request = new Request(new URL(this.path.replace('%PAGE%', page), this.url), this.requestOptions);
        let data = await this.fetchDOM(request, this.queryMangas);
        return data.map(element => {
            return {
                id: this.getRootRelativeOrAbsoluteLink(element.pathname, this.url),
                title: element.nextElementSibling.textContent.trim()
            };
        });
    }

}