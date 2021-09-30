import WordPressMadaraNovel from './templates/WordPressMadaraNovel.mjs';

export default class RachelScanlator extends WordPressMadaraNovel {

    constructor() {
        super();
        super.id = 'rachelscanlator';
        super.label = 'Rachel Scanlator';
        this.tags = [ 'manga', 'webtoon', 'portuguese', 'scanlation' ];
        this.url = 'https://rachelscanlator.com';
    }
}