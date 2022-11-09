import WordPressMadara from './templates/WordPressMadara.mjs';

export default class ComicHub extends WordPressMadara {

    constructor() {
        super();
        super.id = 'comichub';
        super.label = 'ComicHub';
        this.tags = [ 'comic', 'english' ];
        this.url = 'https://comiconline.org/';
    }
}
