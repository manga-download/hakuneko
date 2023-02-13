import WordPressMadara from './templates/WordPressMadara.mjs';

export default class Aiinscan extends WordPressMadara {

    constructor() {
        super();
        super.id = 'komikbree';
        super.label = 'KomikBree';
        this.tags = [ 'manga', 'high-quality', 'indonesian', 'scanlation', 'manhua', 'manhwa' ];
        this.url = 'https://komikbree.xyz';
    }
}