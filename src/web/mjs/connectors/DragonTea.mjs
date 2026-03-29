import WordPressMadara from './templates/WordPressMadara.mjs';

export default class DragonTea extends WordPressMadara {

    constructor() {
        super();
        super.id = 'dragontea';
        super.label = 'Dragon Tea Scans';
        this.tags = [ 'webtoon', 'english' ];
        this.url = 'https://dragontea.ink';
    }
}