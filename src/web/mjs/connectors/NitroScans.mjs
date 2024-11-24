import WordPressMadara from './templates/WordPressMadara.mjs';

export default class NitroScans extends WordPressMadara {

    constructor() {
        super();
        super.id = 'nitroscans';
        super.label = 'Nitro Manga';
        this.tags = [ 'webtoon', 'english' ];
        this.url = 'https://nitromanga.com';
    }
}
