import WordPressMadara from './templates/WordPressMadara.mjs';

export default class Muctau extends WordPressMadara {

    constructor() {
        super();
        super.id = 'muctau';
        super.label = 'Muctau';
        this.tags = ['webtoon', 'english', ];
        this.url = 'https://muctau.com';
    }
}
