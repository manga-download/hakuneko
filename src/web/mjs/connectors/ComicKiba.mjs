import WordPressMadara from './templates/WordPressMadara.mjs';

export default class ComicKiba extends WordPressMadara {

    constructor() {
        super();
        super.id = 'comickiba';
        super.label = 'Comic Kiba';
        this.tags = [ 'manga', 'webtoon', 'english' ];
        this.url = 'https://comickiba.com';

        this.queryPages = 'div.read-container source[src]:not([src=""])';
    }
}