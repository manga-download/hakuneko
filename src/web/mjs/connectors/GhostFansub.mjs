import WordPressMadara from './templates/WordPressMadara.mjs';

export default class GhostFansub extends WordPressMadara {

    constructor() {
        super();
        super.id = 'ghostfansub';
        super.label = 'Ghost Fansub';
        this.tags = [ 'webtoon', 'hentai', 'turkish' ];
        this.url = 'https://ghostfansub.com';
    }
}