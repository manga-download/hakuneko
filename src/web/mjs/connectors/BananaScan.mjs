import WordPressMangastream from './templates/WordPressMangastream.mjs';
export default class BananaScan extends WordPressMangastream {

    constructor() {
        super();
        super.id = 'bananascan';
        super.label = 'Banana Scan';
        this.tags = [ 'manga', 'english' ];
        this.url = 'https://banana-scan.com';
        this.path = '/manga/list-mode/';
    }
}