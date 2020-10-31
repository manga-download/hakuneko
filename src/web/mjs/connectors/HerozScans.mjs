import WordPressMadara from './templates/WordPressMadara.mjs';

export default class HerozScans extends WordPressMadara {

    constructor() {
        super();
        super.id = 'herozscans';
        super.label = 'Heroz Scans';
        this.tags = [ 'webtoon', 'english' ];
        this.url = 'https://herozscans.com';
    }
}