import WordPressMangastream from './templates/WordPressMangastream.mjs';

export default class Kiryuu extends WordPressMangastream {

    constructor() {
        super();
        super.id = 'kiryuu';
        super.label = 'Kiryuu';
        this.tags = [ 'manga', 'indonesian' ];
        this.url = 'https://kiryuu.co';
        this.path = '/manga/list-mode/';

        this.queryChapters = 'div#chapterlist ul li div.eph-num a';
        this.querMangaTitleFromURI = 'div#content div.postbody article h1.entry-title';
    }

    async _getChapters(manga) {
        let request = new Request(new URL(manga.id, this.url), this.requestOptions);
        let data = await this.fetchDOM(request, this.queryChapters);
        return data.map(element => {
            this.adLinkDecrypt(element);
            return {
                id: this.getRootRelativeOrAbsoluteLink(element, request.url),
                title: element.querySelector('span.chapternum').textContent.trim(),
                language: ''
            };
        });
    }

    async _getPages(chapter) {
        let pageList = await super._getPages(chapter);
        return pageList.filter(link => {
            return !link.includes('.filerun.')
                && !link.endsWith('iklan.png')
                && !link.endsWith('.5.jpg')
                && !link.endsWith(',5.jpg')
                && !link.endsWith('ZZ.jpg');
        });
    }
}