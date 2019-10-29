import WordPressZbulu from './templates/WordPressZbulu.mjs';

export default class MangaHay extends WordPressZbulu {

    constructor() {
        super();
        super.id = 'mangahay';
        super.label = 'Bulu Manga';
        this.tags = [ 'manga', 'webtoon', 'vietnamese' ];
        this.url = 'https://mangahay.net';
        this.path = '/danh-sach-truyen';
        this.pathMangas = this.path + '/page/%PAGE%';
        this.pathChapters = '/page/%PAGE%';
    }
}