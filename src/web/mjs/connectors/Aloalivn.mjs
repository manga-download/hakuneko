import WordPressMadara from './templates/WordPressMadara.mjs';

export default class Aloalivn extends WordPressMadara {

    constructor() {
        super();
        super.id = 'aloalivn';
        super.label = 'Aloalivn';
        this.tags = [ 'manga', 'webtoon', 'english' ];
        this.url = 'https://aloalivn.com';
        this.queryPages = 'li.blocks-gallery-item source';
    }
}