import WordPressMadara from './templates/WordPressMadara.mjs';

export default class ManhuaFast extends WordPressMadara {

    constructor() {
        super();
        super.id = 'manhuafast';
        super.label = 'Manhuafast';
        this.tags = [ 'webtoon', 'english' ];
        this.url = 'https://manhuafast.com';

        this.queryPages = 'figure source, div.page-break source';
    }
}