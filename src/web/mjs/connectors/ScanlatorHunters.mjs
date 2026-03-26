import WordPressMadara from './templates/WordPressMadara.mjs';

export default class ScanlatorHunters extends WordPressMadara {

    constructor() {
        super();
        super.id = 'scanlatorhunters';
        super.label = 'Scanlator Hunters';
        this.tags = [ 'manga', 'webtoon', 'portuguese' ];
        this.url = 'https://scanlatorhunters.com';
    }
}