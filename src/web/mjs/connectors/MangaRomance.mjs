import SoraOne from './templates/SoraOne.mjs';

export default class MangaRomance extends SoraOne {

    constructor() {
        super();
        super.id = 'mangaromance';
        super.label = 'Manga Romance';
        this.tags = [ 'webtoon', 'english' ];
        this.url = 'https://www.mangaromance.eu';
    }
}