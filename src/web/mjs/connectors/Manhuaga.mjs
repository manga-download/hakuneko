import WordPressMangaStream from './templates/WordPressMangaStream.mjs';

export default class Manhuaga extends WordPressMangaStream {

    constructor() {
        super();
        super.id = 'manhuaga';
        super.label = 'Manhuaga';
        this.tags = [ 'webtoon', 'english' ];
        this.url = 'https://manhuaga.com';
        this.path = '/manga/list-mode/';
    }
}
