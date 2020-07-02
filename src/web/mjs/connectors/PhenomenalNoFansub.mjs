import WordPressMadara from './templates/WordPressMadara.mjs';

export default class PhenomenalNoFansub extends WordPressMadara {

    constructor() {
        super();
        super.id = 'phenomenalnofansub';
        super.label = 'Phenomenal No Fansub';
        this.tags = [ 'webtoon', 'spanish' ];
        this.url = 'https://phenomenalnofansub.com';
    }
}