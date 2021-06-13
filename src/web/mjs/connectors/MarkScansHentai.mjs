import WordPressMadara from './templates/WordPressMadara.mjs';

export default class MarkScansHentai extends WordPressMadara {

    constructor() {
        super();
        super.id = 'markscanshentai';
        super.label = 'Mark Scans Hentai';
        this.tags = [ 'webtoon', 'portuguese', 'hentai' ];
        this.url = 'https://mhentais.com';
    }
}