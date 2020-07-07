import WordPressMadara from './templates/WordPressMadara.mjs';

export default class SkyMangas extends WordPressMadara {

    constructor() {
        super();
        super.id = 'skymangas';
        super.label = 'Sky Mangas';
        this.tags = [ 'webtoon', 'spanish' ];
        this.url = 'https://skymangas.com';
    }
}