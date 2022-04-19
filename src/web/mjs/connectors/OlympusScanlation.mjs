import WordPressMadara from './templates/WordPressMadara.mjs';

export default class OlympusScanlation extends WordPressMadara {

    constructor() {
        super();
        super.id = 'olympusscanlation';
        super.label = 'Olympus Scanlation';
        this.tags = [ 'webtoon', 'spanish' ];
        this.url = 'https://olympusscanlation.com';
    }
}
