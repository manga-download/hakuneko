import WordPressMadara from './templates/WordPressMadara.mjs';

export default class FenixScan extends WordPressMadara {

    constructor() {
        super();
        super.id = 'fenixscan';
        super.label = 'Manga Fenix';
        this.tags = [ 'webtoon', 'spanish' ];
        this.url = 'https://manga-fenix.com';
    }
}