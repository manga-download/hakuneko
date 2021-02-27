import WordPressMadara from './templates/WordPressMadara.mjs';

export default class MorpheusFansub extends WordPressMadara {

    constructor() {
        super();
        super.id = 'morpheusfansub';
        super.label = 'Morpheus Fansub';
        this.tags = [ 'manga', 'webtoon', 'turkish' ];
        this.url = 'https://morpheus.animemangabilgileri.com';

        this.queryTitleForURI = 'div.profile-manga div.post-title h1';
    }
}