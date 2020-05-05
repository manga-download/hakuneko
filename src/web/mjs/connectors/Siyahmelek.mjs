import WordPressMadara from './templates/WordPressMadara.mjs';

export default class Siyahmelek extends WordPressMadara {

    constructor() {
        super();
        super.id = 'siyahmelek';
        super.label = 'Siyahmelek';
        this.tags = [ 'manga', 'webtoon', 'turkish' ];
        this.url = 'https://siyahmelek.com';
    }
}