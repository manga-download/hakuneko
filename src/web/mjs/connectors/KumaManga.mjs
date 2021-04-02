import WordPressMangastream from './templates/WordPressMangastream.mjs';

export default class KumaManga extends WordPressMangastream {

    constructor() {
        super();
        super.id = 'kumamanga';
        super.label = 'KumaManga';
        this.tags = [ 'manga', 'indonesian' ];
        this.url = 'https://kumamanga.my.id';
        this.path = '/manga-list/?list';

        this.querMangaTitleFromURI = 'div.series-title h2';
        this.queryMangas = 'div.mangalist-blc ul li a';
        this.queryChapters = 'div.series-chapter ul.series-chapterlist li div.flexch-infoz a';
        this.queryChaptersTitle = 'span';
        this.queryPages = 'div.reader-area img[src]:not([src=""])';
    }

    async _getChapters(manga) {
        let request = new Request(new URL(manga.id, this.url), this.requestOptions);
        let data = await this.fetchDOM(request, this.queryChapters);
        return data.map(element => {
            this.adLinkDecrypt(element);
            if(this.queryChaptersTitleBloat) {
                [...element.querySelectorAll(this.queryChaptersTitleBloat)].forEach(bloat => {
                    if(bloat.parentElement) {
                        bloat.parentElement.removeChild(bloat);
                    }
                });
            }
            const title = this.queryChaptersTitle ? element.querySelector(this.queryChaptersTitle).childNodes[0].nodeValue : element.text;
            return {
                id: this.getRootRelativeOrAbsoluteLink(element, request.url),
                title: title.replace(manga.title, '').trim()
            };
        });
    }
}
