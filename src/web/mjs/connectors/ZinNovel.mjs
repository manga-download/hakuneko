import WordPressMadaraNovel from './templates/WordPressMadaraNovel.mjs';

export default class ZinNovel extends WordPressMadaraNovel {

    constructor() {
        super();
        super.id = 'zinnovel';
        super.label = 'ZinNovel';
        this.tags = [ 'novel', 'english' ];
        this.url = 'https://zinnovel.com';
    }
}