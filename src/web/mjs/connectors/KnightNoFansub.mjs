import WordPressMadara from './templates/WordPressMadara.mjs';

/**
 *
 */
export default class KnightNoFansub extends WordPressMadara {

    /**
     *
     */
    constructor() {
        super();
        super.id = 'knightnofansub';
        super.label = 'Knight no Fansub';
        this.tags = [ 'webtoon', 'high-quality', 'spanish', 'scanlation' ];
        this.url = 'https://knightnofansub.site';
    }
}