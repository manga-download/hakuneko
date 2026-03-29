import WordPressMangastream from './templates/WordPressMangastream.mjs';

export default class RadiantScans extends WordPressMangastream {
    constructor() {
        super();
        super.id = 'radiantscans';
        super.label = 'RadiantScans';
        this.tags = [ 'manga', 'english', 'scanlation' ];
        this.url = 'https://radiantscans.com';
        this.path = '/series/list-mode/';

        this.queryChapters = 'div#chapterlist ul li a';
    }

    get icon() {
        return '/img/connectors/luminousscans';
    }

    async _getPages(chapter) {
        return (await super._getPages(chapter)).filter(image => !/\/NovelBanner[^.]+\.(png|jpeg|jpg|gif)$/i.test(image));
    }
}