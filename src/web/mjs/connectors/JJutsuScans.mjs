import WordPressMadara from './templates/WordPressMadara.mjs';

export default class JJutsuScans extends WordPressMadara {

    constructor() {
        super();
        super.id = 'jjutsuscans';
        super.label = 'JJutsu Scans';
        this.tags = [ 'webtoon', 'english' ];
        this.url = 'https://www.jjutsuscans.com';
    }
}