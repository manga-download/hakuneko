import MojoPortalComic from './templates/MojoPortalComic.mjs';

export default class TruyenTranhAudio extends MojoPortalComic {

    constructor() {
        super();
        super.id = 'truyentranhaudio';
        super.label = 'Truyện Tranh Audio';
        this.tags = [ 'webtoon', 'vietnamese' ];
        this.url = 'http://truyentranhaudio.com';
        this.requestOptions.headers.set('x-referer', this.url);

        this.queryMangaTitle = 'article#item-detail h1.title-detail';
    }
}