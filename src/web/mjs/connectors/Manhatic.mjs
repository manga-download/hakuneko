import WordPressMadara from './templates/WordPressMadara.mjs';

export default class ManHatic extends WordPressMadara {

    constructor() {
        super();
        super.id = 'manhatic';
        super.label = 'ManHatic';
        this.tags = [ 'webtoon', 'arabic', 'hentai' ];
        this.url = 'https://manhatic.com';
    }
}