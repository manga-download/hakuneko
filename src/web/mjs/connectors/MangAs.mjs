import MangaReaderCMS from './templates/MangaReaderCMS.mjs';

export default class MangAs extends MangaReaderCMS {

    constructor() {
        super();
        super.id = 'mangas';
        super.label = 'MangAs';
        this.tags = [ 'manga', 'spanish' ];
        this.url = 'https://mangas.in';

        this.language = 'es';
    }

    async _getChapters(manga) {
        let request = new Request(new URL(manga.id, this.url), this.requestOptions);
        let data = await this.fetchDOM(request, this.queryChapters);
        return data.map(element => {
            return {
                id: this.getRootRelativeOrAbsoluteLink(element.querySelector('a.chapter_link'), this.url),
                title: element.textContent.replace('→', '').replace(/\s*:\s*$/, '').replace(manga.title, '').trim(),
                language: this.language
            };
        });
    }
}