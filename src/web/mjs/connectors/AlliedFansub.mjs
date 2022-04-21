import WordPressMangastream from './templates/WordPressMangastream.mjs';

export default class AlliedFansub extends WordPressMangastream {

    constructor() {
        super();
        super.id = 'alliedfansub';
        super.label = 'Allied Fansub';
        this.tags = [ 'webtoon', 'turkish', 'scanlation' ];
        this.url = 'https://alliedfansub.online';
        this.path = '/manga/list-mode/';
        this.requestOptions.headers.set('x-referer', this.url);
    }
}
