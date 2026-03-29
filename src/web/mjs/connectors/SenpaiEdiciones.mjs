import WordPressMangastream from './templates/WordPressMangastream.mjs';

export default class SenpaiEdiciones extends WordPressMangastream {

    constructor() {
        super();
        super.id = 'senpaiediciones';
        super.label = 'Senpai Ediciones';
        this.tags = [ 'webtoon', 'spanish' ];
        this.url = 'https://senpaiediciones.com';
        this.path = '/manga/list-mode/';
    }
}