import WordPressMadara from './templates/WordPressMadara.mjs';

export default class DragonTranslation extends WordPressMadara {

    constructor() {
        super();
        super.id = 'dragontranslation';
        super.label = 'DragonTranslation';
        this.tags = [ 'webtoon', 'hentai', 'spanish' ];
        this.url = 'https://dragontranslation.com';
    }
}