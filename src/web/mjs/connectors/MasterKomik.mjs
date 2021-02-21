import WordPressMangastream from './templates/WordPressMangastream.mjs';

export default class MasterKomik extends WordPressMangastream {

    constructor() {
        super();
        super.id = 'masterkomik';
        super.label = 'MasterKomik';
        this.tags = [ 'manga', 'webtoon', 'indonesian' ];
        this.url = 'https://masterkomik.com';
        this.path = '/manga/?list';
    }
}