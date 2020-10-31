import WordPressMadara from './templates/WordPressMadara.mjs';

export default class KlanKomik extends WordPressMadara {

    constructor() {
        super();
        super.id = 'klankomik';
        super.label = 'KlanKomik';
        this.tags = [ 'webtoon', 'indonesian' ];
        this.url = 'https://klankomik.com';
    }
}