import WordPressMadara from './templates/WordPressMadara.mjs';

export default class BlackDragonsFansub extends WordPressMadara {

    constructor() {
        super();
        super.id = 'bdsfansub';
        super.label = 'Black Dragons no Fansub';
        this.tags = [ 'manga', 'webtoon', 'spanish' ];
        this.url = 'https://bdsfansub.com';
    }
}