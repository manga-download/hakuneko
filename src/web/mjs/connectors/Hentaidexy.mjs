import WordPressMadara from './templates/WordPressMadara.mjs';

export default class Hentaidexy extends WordPressMadara {

    constructor() {
        super();
        super.id = 'hentaidexy';
        super.label = 'Hentaidexy';
        this.tags = [ 'webtoon', 'hentai', 'english' ];
        this.url = 'https://hentaidexy.com';
    }
}