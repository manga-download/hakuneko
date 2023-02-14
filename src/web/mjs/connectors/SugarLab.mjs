import WordPressMangastream from './templates/WordPressMangastream.mjs';

export default class SugarLab extends WordPressMangastream {

    constructor() {
        super();
        super.id = 'sugarlab';
        super.label = 'SugarLab';
        this.tags = ['manga', 'hentai', 'indonesian'];
        this.url = 'https://sugarlab.my.id';
        this.path = '/manga/list-mode/';
    }
}
