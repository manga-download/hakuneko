import WordPressMadara from './templates/WordPressMadara.mjs';

export default class LilyManga extends WordPressMadara {

    constructor() {
        super();
        super.id = 'lilymanga';
        super.label = 'Lily Manga';
        this.tags = [ 'manga', 'english' ];
        this.url = 'https://lilymanga.com';
    }
}