import Novelcool from './templates/Novelcool.mjs';

export default class NovelcoolFR extends Novelcool {
    constructor() {
        super();
        super.id = 'novelcool-fr';
        super.label = 'Novel Cool (FR)';
        this.tags = [ 'french', 'manga', 'webtoon'];
        this.url = 'https://fr.novelcool.com';
    }
}