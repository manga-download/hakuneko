import WordPressMadara from './templates/WordPressMadara.mjs';

export default class OnManga extends WordPressMadara {

    constructor() {
        super();
        super.id = 'onmanga';
        super.label = 'On Manga';
        this.tags = [ 'webtoon', 'english' ];
        this.url = 'https://onmanga.com';
    }
}