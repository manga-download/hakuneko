import MangaChan from './MangaChan.mjs';

/**
 * Template: MangaChan
 */
export default class YaoiChan extends MangaChan {

    /**
     *
     */
    constructor() {
        super();
        super.id = 'yaoichan';
        super.label = 'Яой-тян (Yaoi-chan)';
        this.tags = [ 'hentai', 'russian' ];
        this.url = 'http://yaoi-chan.me';

        this.queryChapters = 'table.table_cha tr td div.manga a';
    }
}