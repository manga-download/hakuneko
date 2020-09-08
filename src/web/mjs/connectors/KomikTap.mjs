import WordPressEManga from './templates/WordPressEManga.mjs';

export default class KomikTap extends WordPressEManga {

    constructor() {
        super();
        super.id = 'komiktap';
        super.label = 'KomikTap';
        this.tags = [ 'manga', 'webtoon', 'hentai', 'indonesian' ];
        this.url = 'https://komiktap.in';
        this.path = '/manga/?list';

        this.queryMangas = 'div#content div.soralist ul li a.series';
        this.queryChapters = 'div.bxcl ul li span.lchx a';
    }
}