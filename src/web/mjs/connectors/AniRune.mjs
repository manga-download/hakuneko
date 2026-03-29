import WordPressMadara from './templates/WordPressMadara.mjs';

export default class AniRune extends WordPressMadara {

    constructor() {
        super();
        super.id = 'anirune';
        super.label = 'AniRune';
        this.tags = [ 'manga', 'webtoon', 'turkish' ];
        this.url = 'https://anirune.com';
    }
}