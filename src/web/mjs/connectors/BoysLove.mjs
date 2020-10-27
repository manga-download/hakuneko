import WordPressMadara from './templates/WordPressMadara.mjs';

export default class BoysLove extends WordPressMadara {

    constructor() {
        super();
        super.id = 'boyslove';
        super.label = 'Boys Love';
        this.tags = [ 'manga', 'webtoon', 'hentai', 'english' ];
        this.url = 'https://boyslove.me';
    }
}