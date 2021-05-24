import WordPressMadara from './templates/WordPressMadara.mjs';

export default class Mgkomik extends WordPressMadara {

    constructor() {
        super();
        super.id = 'mgkomik';
        super.label = 'MGKOMIK';
        this.tags = [ 'webtoon', 'indonesian' ];
        this.url = 'https://mgkomik.com';
    }
}