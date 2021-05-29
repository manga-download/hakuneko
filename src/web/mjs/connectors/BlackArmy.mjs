import WordPressMangastream from './templates/WordPressMangastream.mjs';

export default class BlackArmy extends WordPressMangastream {

    constructor() {
        super();
        super.id = 'blackarmy';
        super.label = 'Black Army';
        this.tags = [ 'manga', 'webtoon', 'french' ];
        this.url = 'https://blackarmy.fr';
        this.path = '/manga/list-mode/';
    }
}