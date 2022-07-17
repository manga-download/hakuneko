import MangaIndoWeb from "./MangaIndoWeb.mjs";

export default class MangaCdn extends MangaIndoWeb {
    constructor() {
        super();
        super.id = 'mangacdn';
        super.label = 'Mangaindo';
        this.tags = [ 'manga', 'indonesian' ];
        this.url = 'https://mangacdn.my.id'; // alternate domain of MangaIndoWeb?

        this.queryPages = 'div.entry-content source[data-src]';
    }

    async _getChapters(manga) {
        const uri = new URL(manga.id, this.url);
        const request = new Request( uri, this.requestOptions );
        let data = await this.fetchDOM(request, this.queryChapters);

        return data.map(element => {
            return {
                id: this.getRootRelativeOrAbsoluteLink(element, this.url),
                title: element.text.replace( new RegExp(manga.title.replace('?', '\\?'), 'i'), '' ).replace( '–', '' ).trim()
            };
        });
    }

    async _getPages(chapter) {
        const uri = new URL(chapter.id, this.url);
        const request = new Request(uri, this.requestOptions);
        let data = await this.fetchDOM(request, this.queryPages);

        return data.map(element => element.dataset['src']);
    }
}