import WordPressMadara from './templates/WordPressMadara.mjs';

export default class MindaFanSub extends WordPressMadara {

    constructor() {
        super();
        super.id = 'mindafansub';
        super.label = 'Minda Fansub';
        this.tags = ['webtoon', 'turkish', 'scanlation'];
        this.url = 'https://mindafansub.online';
    }
}
