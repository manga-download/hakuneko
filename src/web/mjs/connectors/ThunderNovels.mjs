import WordPressMadaraNovel from './templates/WordPressMadaraNovel.mjs';

export default class ThunderNovels extends WordPressMadaraNovel {

    constructor() {
        super();
        super.id = 'thundernovels';
        super.label = 'Thunder Novels';
        this.tags = [ 'novel', 'portuguese' ];
        this.url = 'https://thundernovels.xyz';

        this.novelObstaclesQuery = 'div#text-chapter-toolbar, div.ad, div.ap_container';
    }
}