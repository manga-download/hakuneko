import WordPressMadara from './templates/WordPressMadara.mjs';

export default class GeassHentai extends WordPressMadara {

    constructor() {
        super();
        super.id = 'geasshentai';
        super.label = 'Geass Hentai';
        this.tags = [ 'webtoon', 'hentai', 'portuguese' ];
        this.url = 'https://geasshentai.xyz';
    }
}