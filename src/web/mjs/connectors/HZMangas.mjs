import WordPressMadara from './templates/WordPressMadara.mjs';

export default class HZMangas extends WordPressMadara {

    constructor() {
        super();
        super.id = 'hzmangas';
        super.label = 'Hz Manga';
        this.tags = [ 'webtoon', 'spanish' ];
        this.url = 'http://hzmangas.com';
    }
}