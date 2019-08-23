import WordPressMadara from './templates/WordPressMadara.mjs';

/**
 *
 */
export default class ManhwaHentaiMe extends WordPressMadara {

    /**
     *
     */
    constructor() {
        super();
        super.id = 'manhwahentaime';
        super.label = 'ManhwaHentai.me';
        this.tags = [ 'hentai', 'english' ];
        this.url = 'https://manhwahentai.me';

        this.queryPages = 'div.page-break source';
    }
}