import WordPressMadara from './templates/WordPressMadara.mjs';

/**
 *
 */
export default class YokaiJump extends WordPressMadara {

    /**
     *
     */
    constructor() {
        super();
        super.id = 'yokaijump';
        super.label = 'Yokai Jump';
        this.tags = [ 'manga', 'webtoon', 'french' ];
        this.url = 'https://yokaijump.fr';
    }
}