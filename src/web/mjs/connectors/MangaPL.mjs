import WordPressMadara from './templates/WordPressMadara.mjs';
export default class MangaPL extends WordPressMadara {

    constructor() {
        super();
        super.id = 'mangapl';
        super.label = 'MangaPL';
        this.tags = [ 'hentai', 'korean', 'chinese', 'japanese' ];
        this.url = 'https://mangapl.com';
    }
}