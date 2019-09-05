import WordPressMadara from './templates/WordPressMadara.mjs';

/**
 *
 */
export default class Toonily extends WordPressMadara {

    /**
     *
     */
    constructor() {
        super();
        super.id = 'toonily';
        super.label = 'Toonily';
        this.tags = [ 'webtoon', 'english' ];
        this.url = 'https://toonily.com';
    }
}