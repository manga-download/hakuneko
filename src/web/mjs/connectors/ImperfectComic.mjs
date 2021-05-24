import WordPressMadara from './templates/WordPressMadara.mjs';

export default class ImperfectComic extends WordPressMadara {

    constructor() {
        super();
        super.id = 'imperfectcomic';
        super.label = 'Imperfect Comic';
        this.tags = [ 'webtoon', 'english' ];
        this.url = 'https://imperfectcomic.com';
    }
}