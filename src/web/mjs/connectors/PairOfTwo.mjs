import WordPressMangastream from './templates/WordPressMangastream.mjs';
export default class PairOfTwo extends WordPressMangastream {

    constructor() {
        super();
        super.id = 'pairoftwo';
        super.label = 'Pair of 2';
        this.tags = [ 'manga', 'english' ];
        this.url = 'https://pairof2.com';
        this.path = '/manga/list-mode/';
    }
}