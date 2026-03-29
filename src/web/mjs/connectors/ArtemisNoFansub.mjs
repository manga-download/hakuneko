import WordPressMadaraNovel from './templates/WordPressMadaraNovel.mjs';

export default class ArtemisNoFansub extends WordPressMadaraNovel {

    constructor() {
        super();
        super.id = 'artemisnofansub';
        super.label = 'Artemis No Fansub';
        this.tags = [ 'webtoon', 'novel', 'spanish', 'scanlation' ];
        this.url = 'https://artemisnf.com';

        this.novelContentQuery = 'div.reading-content div[class^="text-"';
    }
}