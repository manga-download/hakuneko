import WordPressMadara from './templates/WordPressMadara.mjs';

export default class MixedManga extends WordPressMadara {

    constructor() {
        super();
        super.id = 'mixedmanga';
        super.label = 'MixedManga';
        this.tags = [ 'webtoon', 'english' ];
        this.url = 'https://mixedmanga.com';
    }
}