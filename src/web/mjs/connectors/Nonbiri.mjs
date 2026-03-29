import WordPressMangastream from './templates/WordPressMangastream.mjs';

export default class Nonbiri extends WordPressMangastream {

    constructor() {
        super();
        super.id = 'nonbiri';
        super.label = 'Comic21';
        this.tags = ['manga', 'indonesian'];
        this.url = 'https://comic21.me';
        this.path = '/manga/list-mode/';
    }
}
