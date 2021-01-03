import WordPressMadara from './templates/WordPressMadara.mjs';

export default class MangaDropOut extends WordPressMadara {

    constructor() {
        super();
        super.id = 'mangadropout';
        super.label = 'KomikTap (MDO)';
        this.tags = [ 'webtoon', 'hentai', 'indonesian' ];
        this.url = 'https://manhwa.komiktap.co';

        this.queryTitleForURI = 'div.post-title h1';
    }
}