import WordPressMadaraNovel from './templates/WordPressMadaraNovel.mjs';

export default class MysticalMerries extends WordPressMadaraNovel {

    constructor() {
        super();
        super.id = 'mysticalmerries';
        super.label = 'Mystical Merries';
        this.tags = [ 'webtoon', 'novel', 'english' ];
        this.url = 'https://mysticalmerries.com';

        this.novelObstaclesQuery = 'div#text-chapter-toolbar, div.ad, div.go-to-top';
    }
}