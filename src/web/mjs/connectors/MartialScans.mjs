import WordPressMadara from './templates/WordPressMadara.mjs';

export default class MartialScans extends WordPressMadara {

    constructor() {
        super();
        super.id = 'martialscans';
        super.label = 'Martial Scans';
        this.tags = [ 'manga', 'webtoon' ,'english' ];
        this.url = 'https://martialscans.com';

        this.queryMangas = 'div.post-title h3 a:not([target]), div.post-title h5 a:not([target])';
    }
}