import WordPressMadara from './templates/WordPressMadara.mjs';

export default class blmanhwaclub extends WordPressMadara {

    constructor() {
        super();
        super.id = 'blmanhwaclub';
        super.label = 'BL Manhwa Club';
        this.tags = [ 'webtoon', 'portuguese' ];
        this.url = 'https://blmanhwa.club';
    }
}