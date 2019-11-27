import WordPressMadara from './templates/WordPressMadara.mjs';

export default class ToonManga extends WordPressMadara {

    constructor() {
        super();
        super.id = 'toonmanga';
        super.label = 'ToonManga';
        this.tags = [ 'webtoon', 'english' ];
        this.url = 'https://toonmanga.com';
    }
}