import WordPressMadara from './templates/WordPressMadara.mjs';

export default class RomantikManga extends WordPressMadara {

    constructor() {
        super();
        super.id = 'romantikmanga';
        super.label = 'RomantikManga';
        this.tags = [ 'webtoon', 'turkish', 'scanlation' ];
        this.url = 'https://romantikmanga.com';
        this.requestOptions.headers.set('x-referer', this.url);
    }
}