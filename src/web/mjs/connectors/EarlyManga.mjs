import WordPressMadara from './templates/WordPressMadara.mjs';

export default class EarlyManga extends WordPressMadara {

    constructor() {
        super();
        super.id = 'earlymanga';
        super.label = 'EarlyManga';
        this.tags = [ 'webtoon', 'english' ];
        this.url = 'https://earlymanga.website';
    }
}