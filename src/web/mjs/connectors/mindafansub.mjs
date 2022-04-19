import WordPressMangastream from './templates/WordPressMangastream.mjs';

export default class MindaFanSub extends WordPressMangastream {

    constructor() {
        super();
        super.id = 'mindafansub';
        super.label = 'Minda Fansub';
        this.tags = ['webtoon', 'turkish', 'scanlation'];
        this.url = 'https://mindafansub.me';
        this.path = '/manga/list-mode/';
    }
}
