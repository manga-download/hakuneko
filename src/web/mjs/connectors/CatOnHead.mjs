import WordPressMadara from './templates/WordPressMadara.mjs';

export default class CatOnHead extends WordPressMadara {

    constructor() {
        super();
        super.id = 'catonhead';
        super.label = 'Cat on Head Translations';
        this.tags = [ 'webtoon', 'english' ];
        this.url = 'https://catonhead.com';
    }
}