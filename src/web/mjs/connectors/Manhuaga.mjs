import WordPressMadara from './templates/WordPressMadara.mjs';

export default class Manhuaga extends WordPressMadara {

    constructor() {
        super();
        super.id = 'manhuaga';
        super.label = 'Manhuaga';
        this.tags = [ 'webtoon', 'english' ];
        this.url = 'https://manhuaga.com';
    }
}