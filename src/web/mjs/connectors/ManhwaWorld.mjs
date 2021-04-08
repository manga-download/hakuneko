import WordPressMadara from './templates/WordPressMadara.mjs';

export default class ManhwaWorld extends WordPressMadara {

    constructor() {
        super();
        super.id = 'manhwaworld';
        super.label = 'Manhwa World';
        this.tags = [ 'webtoon', 'english' ];
        this.url = 'https://manhwaworld.com';
    }
}