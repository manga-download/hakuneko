import WordPressMadara from './templates/WordPressMadara.mjs';

export default class Wakamics extends WordPressMadara {

    constructor() {
        super();
        super.id = 'wakamics';
        super.label = 'Wakamics';
        this.tags = [ 'webtoon', 'english' ];
        this.url = 'https://wakamics.com';

        this.queryPages = 'div.page-break source, div.text-left p source';
    }
}