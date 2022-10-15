import WordPressMangastream from './templates/WordPressMangastream.mjs';

export default class ImperfectComic extends WordPressMangastream {

    constructor() {
        super();
        super.id = 'imperfectcomic';
        super.label = 'Imperfect Comic';
        this.tags = [ 'webtoon', 'english' ];
        this.url = 'https://imperfectcomic.org';
        this.path = '/manga/list-mode/';
    }
}