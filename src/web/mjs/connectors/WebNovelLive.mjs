import WordPressMadaraNovel from './templates/WordPressMadaraNovel.mjs';

export default class WebNovelLive extends WordPressMadaraNovel {

    constructor() {
        super();
        super.id = 'webnovellive';
        super.label = 'WebNovel';
        this.tags = [ 'webtoon', 'novel', 'english' ];
        this.url = 'https://webnovel.live';
    }
}