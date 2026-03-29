import WordPressMadara from './templates/WordPressMadara.mjs';

export default class OrigamiOrpheans extends WordPressMadara {

    constructor() {
        super();
        super.id = 'origamiorpheans';
        super.label = 'ORIGAMI ORPHEANS';
        this.tags = [ 'manga', 'webtoon', 'portuguese' ];
        this.url = 'https://origami-orpheans.com.br';
    }
}