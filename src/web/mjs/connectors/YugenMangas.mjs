import WordPressMadara from './templates/WordPressMadara.mjs';

export default class YugenMangas extends WordPressMadara {

    constructor() {
        super();
        super.id = 'yugenmangas';
        super.label = 'YugenMangas';
        this.tags = [ 'webtoon', 'spanish' ];
        this.url = 'https://yugenmangas.com';
    }
}