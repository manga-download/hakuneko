import Crunchyroll from './templates/Crunchyroll.mjs';

export default class CrunchyAnime extends Crunchyroll {

    constructor() {
        super();
        super.id = 'crunchyanime';
        super.label = 'Crunchyroll* (Anime)';
        this.tags = [ 'anime', 'high-quality', 'multi-lingual' ];
    }
}