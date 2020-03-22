import WordPressMadara from './templates/WordPressMadara.mjs';

export default class AllManga extends WordPressMadara {

    constructor() {
        super();
        super.id = 'allmanga';
        super.label = 'مانجا العرب (M ARAB)';
        this.tags = [ 'manga', 'arabic' ];
        this.url = 'https://mangaarab.com';
    }
}