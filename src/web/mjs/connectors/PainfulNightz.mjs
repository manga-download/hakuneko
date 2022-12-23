import WordPressMadara from './templates/WordPressMadara.mjs';
export default class PainfulNightz extends WordPressMadara {
    constructor() {
        super();
        super.id = 'painfulnightz';
        super.label = 'PainfulNightz';
        this.tags = [ 'manga', 'webtoon', 'english' ];
        this.url = 'https://painfulnightz.com';
    }
}