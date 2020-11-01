import WordPressMadara from './templates/WordPressMadara.mjs';

export default class SereinScans extends WordPressMadara {

    constructor() {
        super();
        super.id = 'sereinscans';
        super.label = 'Serein Scans';
        this.tags = [ 'webtoon', 'turkish' ];
        this.url = 'https://sereinscans.com';
    }
}