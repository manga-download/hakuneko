import WordPressMangastream from './templates/WordPressMangastream.mjs';

export default class OlympusScanlation extends WordPressMangastream {

    constructor() {
        super();
        super.id = 'olympusscanlation';
        super.label = 'Olympus Scanlation';
        this.tags = [ 'webtoon', 'spanish' ];
        this.url = 'https://olympusscanlation.com';
        this.path = '/manga/list-mode/';
    }
}