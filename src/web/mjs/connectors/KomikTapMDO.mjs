import WordPressMadara from './templates/WordPressMadara.mjs';

export default class KomikTapMDO extends WordPressMadara {

    constructor() {
        super();
        super.id = 'komiktap-mdo';
        super.label = 'KomikTap (MDO)';
        this.tags = [ 'webtoon', 'hentai', 'indonesian' ];
        this.url = 'https://manhwa.komiktap.co';

        this.queryTitleForURI = 'div.post-title h1';
    }
}