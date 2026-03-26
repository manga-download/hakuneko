import WordPressMadaraNovel from './templates/WordPressMadaraNovel.mjs';

export default class ShinobiScans extends WordPressMadaraNovel {

    constructor() {
        super();
        super.id = 'shinobiscans';
        super.label = 'ShinobiScans';
        this.tags = [ 'webtoon', 'novel', 'italian', 'scanlation' ];
        this.url = 'https://shinobiscans.com';

        this.requestOptions.headers.set('x-referer', this.url);
    }
}