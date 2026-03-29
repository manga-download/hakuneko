import Guya from './templates/Guya.mjs';

export default class MagicalTranslators extends Guya {

    constructor() {
        super();
        super.id = 'magicaltranslators';
        super.label = 'Magical Translators';
        this.tags = [ 'manga', 'english', 'spanish', 'polish', 'scanlation' ];
        this.url = 'https://mahoushoujobu.com';
    }
}