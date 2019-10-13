import WordPressMadara from './templates/WordPressMadara.mjs';

export default class ManhuaBox extends WordPressMadara {

    constructor() {
        super();
        super.id = 'manhuabox';
        super.label = 'ManhuaBox';
        this.tags = [ 'webtoon', 'english' ];
        this.url = 'https://manhuabox.net';

        this.queryPages = 'div.reading-content p source';
    }
}