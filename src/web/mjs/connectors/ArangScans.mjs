import WordPressMadara from './templates/WordPressMadara.mjs';

export default class ArangScans extends WordPressMadara {

    constructor() {
        super();
        super.id = 'arangscans';
        super.label = 'Arang Scans';
        this.tags = [ 'webtoon', 'english' ];
        this.url = 'https://arangscans.com';
    }
}