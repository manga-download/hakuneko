import WordPressMadara from './templates/WordPressMadara.mjs';

export default class MangaBoruto extends WordPressMadara {

    constructor() {
        super();
        super.id = 'mangaboruto';
        super.label = 'Manga Boruto';
        this.tags = [ 'hentai', 'indonesian' ];
        this.url = 'https://mangaboruto.xyz';

        this.queryChapters = 'li.wp-manga-chapter > a:first-of-type';
    }
}