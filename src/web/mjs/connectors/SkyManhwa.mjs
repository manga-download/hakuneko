import WordPressMadara from './templates/WordPressMadara.mjs';

export default class SkyManhwa extends WordPressMadara {

    constructor() {
        super();
        super.id = 'skymanhwa';
        super.label = 'Skymanhwa';
        this.tags = [ 'webtoon', 'hentai', 'english' ];
        this.url = 'https://skymanhwa.com';
    }
}