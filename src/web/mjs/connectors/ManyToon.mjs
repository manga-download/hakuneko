import WordPressMadara from './templates/WordPressMadara.mjs';

export default class ManyToon extends WordPressMadara {

    constructor() {
        super();
        super.id = 'manytoon';
        super.label = 'ManyToon';
        this.tags = [ 'webtoon', 'english' ];
        this.url = 'https://manytoon.me'; // Miror?: https://manytoon.com
    }
}