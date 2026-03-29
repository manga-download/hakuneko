import WordPressMadara from './templates/WordPressMadara.mjs';

export default class UyuyanBalik extends WordPressMadara {

    constructor() {
        super();
        super.id = 'uyuyanbalik';
        super.label = 'Uyuyan Balık';
        this.tags = [ 'manga', 'webtoon', 'turkish' ];
        this.url = 'https://uyuyanbalik.com';
    }
}