import WordPressMangastream from './templates/WordPressMangastream.mjs';

export default class FlameScansORG extends WordPressMangastream {

    constructor() {
        super();
        super.id = 'flamescans-org';
        super.label = 'Flame Scans';
        this.tags = [ 'manga', 'webtoon', 'english' ];
        this.url = 'https://flamescans.org';
        this.path = '/manga/list-mode/';

        this.queryMangas = 'div.postbody div.soralist ul li a.series';
    }
}