import WordPressMadara from './templates/WordPressMadara.mjs';
export default class ManhuaDragon extends WordPressMadara {
    constructor() {
        super();
        super.id = 'manhuadragon';
        super.label = 'ManhuaDragon';
        this.tags = [ 'manga', 'webtoon', 'english' ];
        this.url = 'https://manhuadragon.com';
    }
}