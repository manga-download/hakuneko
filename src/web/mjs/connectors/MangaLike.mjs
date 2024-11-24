import WordPressMadara from './templates/WordPressMadara.mjs';

export default class MangaLike extends WordPressMadara {

    constructor() {
        super();
        super.id = 'mangalike';
        super.label = 'mangalike';
        this.tags = [ 'manga', 'arabic' ];
        this.url = 'https://mangalike.org';
    }
}