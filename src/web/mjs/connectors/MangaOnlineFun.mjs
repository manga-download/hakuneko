import MangaHub from './MangaHub.mjs';

export default class MangaOnlineFun extends MangaHub {

    constructor() {
        super();
        super.id = 'mangaonlinefun';
        super.label = 'MangaOnlineFun';
        this.tags = [ 'manga', 'webtoon', 'english' ];
        this.url = 'https://mangaonline.fun';

        this.path = 'm02';
    }
}