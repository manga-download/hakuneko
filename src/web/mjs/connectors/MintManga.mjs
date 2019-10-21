import ReadManga from './ReadManga.mjs';

export default class MintManga extends ReadManga {

    constructor() {
        super();
        super.id = 'mintmanga';
        super.label = 'MintManga';
        this.tags = [ 'manga', 'webtoon', 'russian' ];
        this.url = 'http://mintmanga.live';

        this.preferSubtitleAsMangaTitle = true;
    }
}