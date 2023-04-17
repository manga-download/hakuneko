import WordPressMangastream from './templates/WordPressMangastream.mjs';

export default class Nonbiri extends WordPressMangastream {

    constructor() {
        super();
        super.id = 'nonbiri';
        super.label = 'Nonbiri';
        this.tags = ['manga', 'indonesian'];
        this.url = 'https://nonbiri.space';
        this.path = '/manga/list-mode/';
    }
}
