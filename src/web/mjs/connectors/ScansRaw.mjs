import WordPressMadara from './templates/WordPressMadara.mjs';

export default class ScansRaw extends WordPressMadara {

    constructor() {
        super();
        super.id = 'scansraw';
        super.label = 'ScansRaw';
        this.tags = [ 'webtoon', 'manga', 'english' ];
        this.url = 'https://scansraw.com';
    }
}