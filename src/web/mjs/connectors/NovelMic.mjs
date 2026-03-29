import WordPressMadara from './templates/WordPressMadara.mjs';

export default class NovelMic extends WordPressMadara {

    constructor() {
        super();
        super.id = 'novelmic';
        super.label = 'NovelMic';
        this.tags = [ 'webtoon', 'english' ];
        this.url = 'https://novelmic.com';
    }
}