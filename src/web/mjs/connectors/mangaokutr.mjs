import WordPressMadara from './templates/WordPressMadara.mjs';

export default class mangatrnet extends WordPressMadara {

    constructor() {
        super();
        super.id = 'mangatrnet';
        super.label = 'mangatr.net';
        this.tags = [ 'manga', 'webtoon', 'turkish' ];
        this.url = 'https://mangatr.net';
    }
}
