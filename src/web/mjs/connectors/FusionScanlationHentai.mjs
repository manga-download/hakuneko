import WordPressMadara from './templates/WordPressMadara.mjs';

export default class FusionScanlation extends WordPressMadara {

    constructor() {
        super();
        super.id = 'fusionscanlation-hentai';
        super.label = 'H Fusion Scanlation';
        this.tags = [ 'webtoon', 'hentai', 'spanish' ];
        this.url = 'https://h.fusionscanlation.com';
    }
}