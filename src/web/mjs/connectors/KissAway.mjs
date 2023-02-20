import FlatManga from './templates/FlatManga.mjs';

export default class KissAway extends FlatManga {

    constructor() {
        super();
        super.id = 'kissaway';
        super.label = 'KLManga';
        this.tags = [ 'manga', 'raw', 'japanese' ];
        this.url = 'https://klmanga.com';
        this.requestOptions.headers.set('x-referer', this.url);
    }

    async _getChapters(manga) {
        manga.id += '?PageSpeed=noscript';
        const chapters = await super._getChapters(manga);
        chapters.forEach(chapter => chapter.id+='?PageSpeed=noscript');
        return chapters;
    }

}
