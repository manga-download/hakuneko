import WordPressMadara from './templates/WordPressMadara.mjs';

export default class GrazeScans extends WordPressMadara {

    constructor() {
        super();
        super.id = 'grazescans';
        super.label = 'GrazeScans';
        this.tags = [ 'webtoon', 'english' ];
        this.url = 'https://grazescans.com';
    }
}