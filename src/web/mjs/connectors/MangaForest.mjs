import MadTheme from './templates/MadTheme.mjs';
export default class MangaForest extends MadTheme {
    constructor() {
        super();
        super.id = 'mangaforest';
        super.label = 'MangaForest';
        this.tags = ['manga', 'webtoon', 'english'];
        this.url = 'https://mangaforest.me';
    }
}
