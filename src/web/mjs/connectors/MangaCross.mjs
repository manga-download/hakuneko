import YoungChampion from './YoungChampion.mjs';

export default class MangaCross extends YoungChampion {

    constructor() {
        super();
        super.id = 'mangacross';
        super.label = 'ChampionCross';
        this.tags = [ 'manga', 'japanese' ];
        this.url = 'https://championcross.jp';
        this.queryManga = 'div.article-text > a';
    }
}
