import WordPressMangastream from './templates/WordPressMangastream.mjs';

export default class CulturedWorks extends WordPressMangastream {
    constructor() {
        super();
        super.id = 'culturedworks';
        super.label = 'CulturedWorks';
        this.tags = ['webtoon', 'english', 'scanlation'];
        this.url = 'https://culturedworks.com';
        this.path = '/manga/list-mode/';
    }
}