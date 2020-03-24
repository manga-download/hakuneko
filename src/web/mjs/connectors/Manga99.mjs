import WordPressLightPro from './MangaDeep.mjs';

export default class Manga99 extends WordPressLightPro {

    constructor() {
        super();
        super.id = 'manga99';
        super.label = 'Manga99';
        this.tags = [ 'manga', 'english' ];
        this.url = 'http://www.manga99.com';
    }
}