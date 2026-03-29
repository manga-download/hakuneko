import WordPressMangastream from './templates/WordPressMangastream.mjs';

export default class Kraw extends WordPressMangastream {

    constructor() {
        super();
        super.id = 'kraw';
        super.label = 'KRAW';
        this.tags = [ 'hentai', 'porn', 'multi-lingual' ];
        this.url = 'https://kraw.org';
        this.path = '/manga/list-mode/';
    }
}
