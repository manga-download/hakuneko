import WordPressMadara from './templates/WordPressMadara.mjs';

export default class LovableSubs extends WordPressMadara {

    constructor() {
        super();
        super.id = 'lovablesubs';
        super.label = 'lovablesubs';
        this.tags = [ 'manga', 'turkish' ];
        this.url = 'https://lovablesubs.com';
    }

    getFormatRegex() {
        return {
            chapterRegex: /\s*(?:^|ch\.?|ep\.?|chapter|Bölüm|chapitre|episode|#)?\s*([\d.?\-?v?,?]+)\s*(?:^|ch\.?|ep\.?|chapter|\.?Bölüm|chapitre|episode|#)?\s*(?:\s|:|$)+/i, // $ not working in character groups => [\s\:$]+ does not work
            volumeRegex: super.getFormatRegex().volumeRegex
        };
    }
}