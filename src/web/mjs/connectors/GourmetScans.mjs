import WordPressMadara from './templates/WordPressMadara.mjs';

export default class GourmetScans extends WordPressMadara {

    constructor() {
        super();
        super.id = 'gourmetscans';
        super.label = 'Gourmet Scans';
        this.tags = [ 'webtoon', 'english' ];
        this.url = 'https://gourmetscans.net';
    }
}