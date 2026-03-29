import WordPressMadaraNovel from './templates/WordPressMadaraNovel.mjs';
export default class MeioNovel extends WordPressMadaraNovel {

    constructor() {
        super();
        super.id = 'meionovel';
        super.label = 'Meio Novel';
        this.tags = [ 'manga', 'webtoon', 'novel', 'indonesian' ];
        this.url = 'https://meionovels.com';
    }
}
