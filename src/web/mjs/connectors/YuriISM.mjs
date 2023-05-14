import FoolSlide from './templates/FoolSlide.mjs';

export default class YuriISM extends FoolSlide {

    constructor() {
        super();
        super.id = 'yuriism';
        super.label = 'YuriISM';
        this.tags = [ 'manga', 'high-quality', 'english', 'scanlation' ];
        this.url = 'https://www.yuri-ism.com';
        this.language = 'english';
    }

    async getMangas() {
        throw new Error('There is no mangas here, please use DynastyScans connector.');
    }

    async getChapters() {
        throw new Error('There is no mangas here, please use DynastyScans connector.');
    }

    async getPages() {
        throw new Error('There is no mangas here, please use DynastyScans connector.');
    }
}
