import WordPressMadara from './templates/WordPressMadara.mjs';

export default class JiroComics extends WordPressMadara {

    constructor() {
        super();
        super.id = 'jirocomics';
        super.label = 'JiroComics';
        this.tags = [ 'manga', 'webtoon', 'english' ];
        this.url = 'https://jirocomics.com';
    }
}