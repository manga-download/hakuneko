import WordPressMadara from './templates/WordPressMadara.mjs';

export default class SkyManga extends WordPressMadara {

    constructor() {
        super();
        super.id = 'skymanga';
        super.label = 'Sky Manga';
        this.tags = [ 'webtoon', 'hentai', 'english' ];
        this.url = 'https://skymanga.xyz';
    }
}
