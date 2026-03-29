import WordPressMadara from './templates/WordPressMadara.mjs';

export default class ManhuaES extends WordPressMadara {

    constructor() {
        super();
        super.id = 'manhuaes';
        super.label = 'ManhuaES';
        this.tags = [ 'manga', 'english' ];
        this.url = 'https://manhuaes.com';

        this.queryPages = 'figure source, div.page-break source';
    }
}