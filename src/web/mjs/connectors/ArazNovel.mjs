import WordPressMadaraNovel from './templates/WordPressMadaraNovel.mjs';

export default class ArazNovel extends WordPressMadaraNovel {

    constructor() {
        super();
        super.id = 'araznovel';
        super.label = 'ArazNovel';
        this.tags = [ 'webtoon', 'novel', 'turkish' ];
        this.url = 'https://araznovel.com';
    }
}