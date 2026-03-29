import WordPressMadara from './templates/WordPressMadara.mjs';

export default class KawaScans extends WordPressMadara {

    constructor() {
        super();
        super.id = 'kawascans';
        super.label = 'KawaScans';
        this.tags = [ 'webtoon', 'english' ];
        this.url = 'https://kawascans.com';
    }
}