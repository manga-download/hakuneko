import WordPressMangastream from './templates/WordPressMangastream.mjs';

export default class FlameScansORG extends WordPressMangastream {

    constructor() {
        super();
        super.id = 'flamescans-org';
        super.label = 'Flame Comics';
        this.tags = [ 'manga', 'webtoon', 'english' ];
        this.url = 'https://flamecomics.com';
        this.path = '/series/list-mode/';

        this.queryMangas = 'div.postbody div.soralist ul li a.series';
        this.queryChapters = 'div#chapterlist ul li a';
    }

    async _getPages(chapter) {
        return (await super._getPages(chapter)).filter(page => !page.includes('readonflamescans.png'));
    }
}
