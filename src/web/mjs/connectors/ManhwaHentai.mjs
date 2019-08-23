import WordPressMadara from './templates/WordPressMadara.mjs';

/**
 *
 */
export default class ManhwaHentai extends WordPressMadara {

    /**
     *
     */
    constructor() {
        super();
        super.id = 'manhwahentai';
        super.label = 'Manhwa Hentai';
        this.tags = [ 'hentai', 'english' ];
        this.url = 'https://manhwahentai.site';

        this.queryPages = 'div.page-break source';
    }
}