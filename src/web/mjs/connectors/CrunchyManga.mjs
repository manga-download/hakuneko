import Crunchyroll from './templates/Crunchyroll.mjs';

export default class CrunchyManga extends Crunchyroll {

    constructor() {
        super();
        super.id = 'crunchymanga';
        super.label = 'Crunchyroll* (Manga)';
        this.tags = [ 'manga', 'high-quality', 'multi-lingual' ];
    }
}