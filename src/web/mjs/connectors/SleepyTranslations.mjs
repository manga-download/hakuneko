import WordPressMadaraNovel from './templates/WordPressMadaraNovel.mjs';

export default class SleepyTranslations extends WordPressMadaraNovel {

    constructor() {
        super();
        super.id = 'sleepytranslations';
        super.label = 'Sleepy Translations';
        this.tags = [ 'webtoon', 'novel', 'english' ];
        this.url = 'https://sleepytranslations.com';

        this.novelObstaclesQuery = 'div#text-chapter-toolbar, div.ad, div.go-to-top';
    }
}