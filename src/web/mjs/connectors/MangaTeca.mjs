import WordPressMadara from './templates/WordPressMadara.mjs';

export default class MangaTeca extends WordPressMadara {

    constructor() {
        super();
        super.id = 'mangateca';
        super.label = 'MangaTeca';
        this.tags = [ 'manga', 'webtoon', 'hentai', 'portuguese' ];
        this.url = 'https://www.mangateca.com';
    }
}