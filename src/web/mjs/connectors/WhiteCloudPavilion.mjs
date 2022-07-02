import WordPressMangastream from './templates/WordPressMangastream.mjs';

export default class WhiteCloudPavilion extends WordPressMangastream {

    constructor() {
        super();
        super.id = 'whitecloudpavilion';
        super.label = 'White Cloud Pavilion';
        this.tags = [ 'manga', 'high-quality', 'english', 'scanlation' ];
        this.url = 'https://www.whitecloudpavilion.com';
        this.path = '/read/list-mode/';
    }
}