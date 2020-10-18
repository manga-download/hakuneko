import WordPressMadara from './templates/WordPressMadara.mjs';

export default class Anikiga extends WordPressMadara {

    constructor() {
        super();
        super.id = 'anikiga';
        super.label = 'Anikiga';
        this.tags = [ 'manga', 'turkish' ];
        this.url = 'http://anikiga.com';
    }
}