import WordPressMangastream from './templates/WordPressMangastream.mjs';

export default class DragonTranslation extends WordPressMangastream {

    constructor() {
        super();
        super.id = 'dragontranslation';
        super.label = 'DragonTranslation';
        this.tags = [ 'webtoon', 'hentai', 'spanish' ];
        this.url = 'https://dragontranslation.com';
        this.path = '/manga/list-mode/';
    }
}