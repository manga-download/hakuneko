import WordPressMadara from './templates/WordPressMadara.mjs';

export default class OlhoDaLua extends WordPressMadara {

    constructor() {
        super();
        super.id = 'olhodalua';
        super.label = 'Olho da Lua';
        this.tags = [ 'manga', 'webtoon', 'portuguese' ];
        this.url = 'https://olhodalua.xyz';
    }
}