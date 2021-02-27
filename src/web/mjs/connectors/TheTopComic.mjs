import WordPressMadara from './templates/WordPressMadara.mjs';

export default class TheTopComic extends WordPressMadara {

    constructor() {
        super();
        super.id = 'thetopcomic';
        super.label = 'The Top Comic';
        this.tags = [ 'webtoon', 'english' ];
        this.url = 'https://thetopcomic.com';
    }
}