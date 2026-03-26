import WordPressMadara from './templates/WordPressMadara.mjs';

export default class NijiTranslations extends WordPressMadara {

    constructor() {
        super();
        super.id = 'nijitranslations';
        super.label = 'مدونة نيجي (Niji Translations)';
        this.tags = [ 'manga', 'arabic' ];
        this.url = 'https://niji-translations.com';
    }
}