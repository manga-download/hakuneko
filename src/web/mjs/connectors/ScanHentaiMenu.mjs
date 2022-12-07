import WordPressMadara from './templates/WordPressMadara.mjs';

export default class ScanHentaiMenu extends WordPressMadara {

    constructor() {
        super();
        super.id = 'scanhentaimenu';
        super.label = 'ScanHentaiMenu';
        this.tags = [ 'webtoon', 'english', 'hentai' ];
        this.url = 'https://scan.hentai.menu';
        this.requestOptions.headers.set( 'x-referer', this.url );
    }
}
