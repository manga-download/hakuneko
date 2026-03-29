import WordPressMadara from './templates/WordPressMadara.mjs';

export default class ManhwaHentai extends WordPressMadara {

    constructor() {
        super();
        super.id = 'manhuas';
        super.label = 'Manhuamix';
        this.tags = [ 'webtoon', 'english' ];
        this.url = 'https://manhuamix.com';
    }
}
