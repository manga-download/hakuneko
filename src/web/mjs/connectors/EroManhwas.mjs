import WordPressMadara from './templates/WordPressMadara.mjs';

export default class EroManhwas extends WordPressMadara {

    constructor() {
        super();
        super.id = 'eromanhwas';
        super.label = 'Eromanhwas';
        this.tags = [ 'webtoon', 'hentai', 'spanish' ];
        this.url = 'https://eromanhwas.com';
    }
}