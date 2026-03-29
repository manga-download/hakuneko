import WordPressMadara from './templates/WordPressMadara.mjs';

export default class Ninjavi extends WordPressMadara {

    constructor() {
        super();
        super.id = 'ninjavi';
        super.label = 'NINJAVI';
        this.tags = [ 'manga', 'webtoon', 'arabic' ];
        this.url = 'https://ninjavi.com';
    }
}