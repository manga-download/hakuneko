import EHentai from './EHentai.mjs';

export default class ExHentai extends EHentai {

    constructor() {
        super();
        super.id = 'exhentai';
        super.label = 'ExHentai';
        this.tags = ['hentai', 'multi-lingual'];
        this.url = 'http://exhentai.org';
        this.requestOptions.headers.set('x-cookie', 'nw=1; yay=EXPIRED');
    }
}