import WordPressMangastream from './templates/WordPressMangastream.mjs';

export default class FlameScansFR extends WordPressMangastream {

    constructor() {
        super();
        super.id = 'flamescans-fr';
        super.label = 'Flame Scans.fr';
        this.tags = [ 'manga', 'webtoon', 'french' ];
        this.url = 'https://flamescans.fr';
        this.path = '/manga/list-mode/';

        this.queryMangas = 'div.postbody div.soralist ul li a.series';
        this.queryChapters = 'div#chapterlist ul li a';
    }

    get icon() {
        return '/img/connectors/flamescans-org';
    }

}
