import WordPressMadara from './templates/WordPressMadara.mjs';

export default class AkuManga extends WordPressMadara {

    constructor() {
        super();
        super.id = 'akumanga';
        super.label = 'AkuManga';
        this.tags = [ 'webtoon', 'arabic' ];
        this.url = 'https://akumanga.com';
    }
}