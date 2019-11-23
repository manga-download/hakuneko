import Crunchyroll from './templates/Crunchyroll.mjs';

// See: https://github.com/CloudMax94/crunchyroll-api/wiki/Api
export default class CrunchyAnime extends Crunchyroll {

    constructor() {
        super();
        super.id = 'crunchyanime';
        super.label = 'Crunchyroll* (Anime)';
        this.tags = [ 'anime', 'high-quality', 'multi-lingual' ];
    }

    async _getMangas() {
        throw new error('Not implemented!');
    }

    async _getChapters(manga) {
        throw new error('Not implemented!');
    }

    async _getPages(chapter) {
        throw new error('Not implemented!');
    }
}