import WordPressMadara from './templates/WordPressMadara.mjs';

export default class YuriVerso extends WordPressMadara {

    constructor() {
        super();
        super.id = 'yuriverso';
        super.label = 'Yuri Verso';
        this.tags = [ 'manga', 'webtoon', 'portuguese' ];
        this.url = 'https://yuri.live';
    }
}