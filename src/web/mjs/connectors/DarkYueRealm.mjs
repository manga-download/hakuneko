import WordPressMadara from './templates/WordPressMadara.mjs';

export default class DarkYueRealm extends WordPressMadara {

    constructor() {
        super();
        super.id = 'darkyuerealm';
        super.label = 'DarkYue Realm';
        this.tags = [ 'manga', 'portuguese' ];
        this.url = 'https://darkyuerealm.site';
    }
}