import WordPressMadara from './templates/WordPressMadara.mjs';

export default class MangasForYou extends WordPressMadara {
    constructor() {
        super();
        super.id = 'mangasforyou';
        super.label = 'Mangas For You';
        this.tags = [ 'manga', 'high-quality', 'portuguese', 'scanlation' ];
        this.url = 'http://www.mangasforyou.top';
        this.language = 'pt';
    }
}