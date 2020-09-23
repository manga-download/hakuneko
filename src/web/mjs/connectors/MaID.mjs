import WordPressMangastream from './templates/WordPressMangastream.mjs';

export default class MaID extends WordPressMangastream {

    constructor() {
        super();
        super.id = 'maid';
        super.label = 'MAID';
        this.tags = [ 'manga', 'indonesian' ];
        this.url = 'https://www.maid.my.id';
        this.path = '/manga-list/?list';

        this.queryMangas = 'div.mangalist-blc ul li.Manga a.series';
        this.queryChapters = 'div.series-chapter ul.series-chapterlist li div.flexch-infoz a';
        this.queryPages = 'div.reader-area source[src]:not([src=""])';
        this.querMangaTitleFromURI = 'div.series-title h2';
    }

    async _getChapters(manga) {
        let request = new Request(new URL(manga.id, this.url), this.requestOptions);
        let data = await this.fetchDOM(request, this.queryChapters);
        return data.map(element => {
            return {
                id: this.getRootRelativeOrAbsoluteLink(element, this.url),
                title: element.querySelector('span.ch').textContent.trim(),
                language: ''
            };
        });
    }
}