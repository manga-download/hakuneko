import HentaiShark from './HentaiShark.mjs';

export default class ReadHentai extends HentaiShark {

    constructor() {
        super();
        super.id = 'readhentai';
        super.label = 'Read Hentai';
        this.tags = ['hentai', 'multi-lingual'];
        this.url = 'https://readhent.ai';
    }
}