import NineManga from './templates/NineManga.mjs';

export default class NineMangaFR extends NineManga {

    constructor() {
        super();
        super.id = 'ninemanga-fr';
        super.label = 'NineMangaFR';
        this.tags = [ 'manga', 'french' ];
        this.url = 'https://fr.ninemanga.com';
    }

    get icon() {
        return '/img/connectors/ninemanga-en';
    }

}