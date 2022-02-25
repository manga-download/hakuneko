import WordPressMadara from './templates/WordPressMadara.mjs';

export default class MangaCave extends WordPressMadara {

    constructor() {
        super();
        super.id = 'mangacave';
        super.label = 'Manga Cave';
        this.tags = [ 'webtoon', 'hentai', 'english' ];
        this.url = 'https://mangacave.com';
    }
}
