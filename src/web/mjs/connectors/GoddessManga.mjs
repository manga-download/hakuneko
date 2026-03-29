import WordPressMadara from './templates/WordPressMadara.mjs';

export default class GoddessManga extends WordPressMadara {

    constructor() {
        super();
        super.id = 'goddessmanga';
        super.label = 'GoddessManga';
        this.tags = [ 'manga', 'webtoon', 'turkish' ];
        this.url = 'https://goddessmanga.com';
    }

    getFormatRegex() {
        return {
            chapterRegex: /\s*(?:^|ch\.?|ep\.?|chapter|Bölüm|chapitre|episode|#)?\s*([\d.?\-?v?,?]+)\s*(?:^|ch\.?|ep\.?|chapter|\.?Bölüm|chapitre|episode|#)?\s*(?:\s|:|$)+/i, // $ not working in character groups => [\s\:$]+ does not work
            volumeRegex: super.getFormatRegex().volumeRegex
        };
    }
}