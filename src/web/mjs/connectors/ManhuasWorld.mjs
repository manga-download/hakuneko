import WordPressMadara from './templates/WordPressMadara.mjs';

export default class ManhuasWorld extends WordPressMadara {

    constructor() {
        super();
        super.id = 'manhuasworld';
        super.label = 'ManhuasWorld';
        this.tags = [ 'webtoon', 'english' ];
        this.url = 'https://manhuasworld.com';
    }
}