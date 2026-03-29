import WordPressMadara from './templates/WordPressMadara.mjs';

export default class InmortalScan extends WordPressMadara {

    constructor() {
        super();
        super.id = 'inmortalscan';
        super.label = 'Inmortal Scan';
        this.tags = [ 'manga', 'webtoon', 'spanish' ];
        this.url = 'https://manga.mundodrama.site';
    }
}