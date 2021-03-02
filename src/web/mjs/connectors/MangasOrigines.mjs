import WordPressMadara from './templates/WordPressMadara.mjs';

export default class MangasOrigines extends WordPressMadara {

    constructor() {
        super();
        super.id = 'mangasorigines';
        super.label = 'Mangas Origines';
        this.tags = [ 'manga', 'webtoons', 'french' ];
        this.url = 'https://mangas-origines.fr';
    }
}