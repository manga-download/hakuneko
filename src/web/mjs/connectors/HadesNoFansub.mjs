import WordPressMadara from './templates/WordPressMadara.mjs';

export default class HadesNoFansub extends WordPressMadara {

    constructor() {
        super();
        super.id = 'hadesnofansub';
        super.label = 'Hades No Fansub';
        this.tags = [ 'webtoon', 'spanish' ];
        this.url = 'https://mangareaderpro.com';
        this.path = '/es';
    }
}