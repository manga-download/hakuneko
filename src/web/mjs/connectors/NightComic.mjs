import WordPressMadara from './templates/WordPressMadara.mjs';

export default class NightComic extends WordPressMadara {

    constructor() {
        super();
        super.id = 'nightcomic';
        super.label = 'NIGHT COMIC';
        this.tags = [ 'webtoon', 'english' ];
        this.url = 'https://nightcomic.com';
    }
}