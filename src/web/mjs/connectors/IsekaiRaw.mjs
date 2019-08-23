import WordPressMadara from './templates/WordPressMadara.mjs';

/**
 *
 */
export default class IsekaiRaw extends WordPressMadara {

    /**
     *
     */
    constructor() {
        super();
        super.id = 'isekairaw';
        super.label = 'IsekaiRaw';
        this.tags = [ 'manga', 'raw', 'japanese' ];
        this.url = 'http://isekairaw.com';
    }
}