import WordPressMadara from './templates/WordPressMadara.mjs';

export default class RandomTranslations extends WordPressMadara {

    constructor() {
        super();
        super.id = 'randomtranslations';
        super.label = 'Random Translations';
        this.tags = [ 'webtoon', 'english' ];
        this.url = 'https://randomtranslations.com';
    }
}