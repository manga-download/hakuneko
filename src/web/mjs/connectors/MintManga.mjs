import ReadManga from './ReadManga.mjs';

export default class MintManga extends ReadManga {

    constructor() {
        super();
        super.id = 'mintmanga';
        super.label = 'MintManga';
        this.tags = [ 'manga', 'webtoon', 'russian' ];
        this.url = 'https://mintmanga.com';

        this.preferSubtitleAsMangaTitle = true;
    }
}