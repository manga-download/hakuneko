import ManhwasNet from './ManhwasNet.mjs';

export default class ManhwasMen extends ManhwasNet {

    constructor() {
        super();
        super.id = 'manhwasmen';
        super.label = 'Manhwas Men';
        this.tags = [ 'webtoon', 'hentai', 'korean', 'english' ];
        this.url = 'https://manhwas.men';
        this.path = '/manga-list';
    }
}