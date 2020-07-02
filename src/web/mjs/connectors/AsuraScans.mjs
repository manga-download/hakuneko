import WordPressMadara from './templates/WordPressMadara.mjs';

export default class AsuraScans extends WordPressMadara {

    constructor() {
        super();
        super.id = 'asurascans';
        super.label = 'Asura Scans';
        this.tags = [ 'webtoon', 'english' ];
        this.url = 'https://asurascans.com';
    }
}