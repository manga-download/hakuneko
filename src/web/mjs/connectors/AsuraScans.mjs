import WordPressMangastream from './templates/WordPressMangastream.mjs';

export default class AsuraScans extends WordPressMangastream {

    constructor() {
        super();
        super.id = 'asurascans';
        super.label = 'Asura Scans';
        this.tags = [ 'webtoon', 'english' ];
        this.url = 'https://asurascans.com';
        this.path = '/manga/list-mode/';

        this.queryPages = 'div#readerarea img[loading]';
    }

    async _getPages(chapter) {
        const images = await super._getPages(chapter);
        return images.filter(link => !/panda_gif_large/i.test(link));
    }
}