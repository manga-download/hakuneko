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
        throw new Error('This website doesn\'t host anything. Use DynastyScans connector instead.');
    }

    async getChapters() {
        throw new Error('This website doesn\'t host anything. Use DynastyScans connector instead.');
    }

    async getPages() {
        throw new Error('This website doesn\'t host anything. Use DynastyScans connector instead.');
    }
}
