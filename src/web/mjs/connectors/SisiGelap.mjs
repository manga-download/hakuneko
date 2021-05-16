import WordPressMadara from './templates/WordPressMadara.mjs';

export default class SisiGelap extends WordPressMadara {

    constructor() {
        super();
        super.id = 'sisigelap';
        super.label = 'SISI GELAP';
        this.tags = [ 'webtoon', 'indonesian' ];
        this.url = 'https://sisigelap.club';
    }
}