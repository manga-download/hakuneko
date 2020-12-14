import WordPressMadara from './templates/WordPressMadara.mjs';

export default class MangaDropOut extends WordPressMadara {

    constructor() {
        super();
        super.id = 'mangadropout';
        super.label = 'MangaDropOut';
        this.tags = [ 'hentai', 'indonesian' ];
        this.url = 'https://www.mangadropout.xyz';

        this.queryTitleForURI = 'div.post-title h1';
    }
}