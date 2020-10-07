import WordPressMadara from './templates/WordPressMadara.mjs';

export default class MangaRawr extends WordPressMadara {

    constructor() {
        super();
        super.id = 'mangarawr';
        super.label = 'MangaRawr';
        this.tags = [ 'manga', 'english' ];
        this.url = 'https://mangarawr.com';
    }
}