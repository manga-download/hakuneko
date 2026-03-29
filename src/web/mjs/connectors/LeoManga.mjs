import WordPressMadara from './templates/WordPressMadara.mjs';

export default class LeoManga extends WordPressMadara {

    constructor() {
        super();
        super.id = 'leomanga';
        super.label = 'LeoManga';
        this.tags = [ 'manga', 'spanish' ];
        this.url = 'https://leomanga.me';
    }
}