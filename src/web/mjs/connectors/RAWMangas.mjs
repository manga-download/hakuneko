import WordPressMadara from './templates/WordPressMadara.mjs';

export default class RAWMangas extends WordPressMadara {

    constructor() {
        super();
        super.id = 'rawmangas';
        super.label = 'RAWMangas';
        this.tags = [ 'manga', 'webtoon', 'english' ];
        this.url = 'https://rawmangas.net';
    }
}