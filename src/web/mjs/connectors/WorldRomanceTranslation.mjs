import WordPressMangastream from './templates/WordPressMangastream.mjs';

export default class WorldRomanceTranslation extends WordPressMangastream {
    constructor() {
        super();
        super.id = 'worldromancetranslation';
        super.label = 'World Romance Translation';
        this.tags = ['manga', 'indonesian'];
        this.url = 'https://wrt.my.id';
        this.path = '/manga/list-mode/';

        this.queryChapters = 'div#chapterlist ul li div.eph-num';
    }

    async _getChapters(manga) {
        let request = new Request(new URL(manga.id, this.url), this.requestOptions);
        let data = await this.fetchDOM(request, this.queryChapters);
        return data.map((element) => {
            const title = element.querySelector(this.queryChaptersTitle).textContent;
            return {
                id: this.getRootRelativeOrAbsoluteLink(element.querySelector('a'), request.url),
                title: title.replace(manga.title, '').trim(),
            };
        });
    }
}