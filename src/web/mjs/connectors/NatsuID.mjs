import WordPressMangastream from './templates/WordPressMangastream.mjs';

export default class NatsuID extends WordPressMangastream {

    constructor() {
        super();
        super.id = 'natsuid';
        super.label = 'NatsuID';
        this.tags = ['manga', 'indonesian'];
        this.url = 'https://natsu.id';
        this.path = '/manga/list-mode/';
    }
}
