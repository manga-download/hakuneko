import WordPressMadara from './templates/WordPressMadara.mjs';

export default class AkumanoTenshi extends WordPressMadara {

    constructor() {
        super();
        super.id = 'akumanotenshi';
        super.label = 'AkumanoTenshi';
        this.tags = [ 'webtoon', 'manga', 'portuguese' ];
        this.url = 'https://akumanotenshi.com';
    }
}
