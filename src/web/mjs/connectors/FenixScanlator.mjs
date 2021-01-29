import WordPressMadara from './templates/WordPressMadara.mjs';

export default class FenixScanlator extends WordPressMadara {

    constructor() {
        super();
        super.id = 'fenixscanlator';
        super.label = 'Fênix Scanlator';
        this.tags = [ 'manga', 'webtoon', 'portuguese' ];
        this.url = 'https://fenixscanlator.xyz';
    }
}