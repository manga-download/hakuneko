import WordPressMadara from './templates/WordPressMadara.mjs';

export default class FurioScans extends WordPressMadara {

    constructor() {
        super();
        super.id = 'furioscans';
        super.label = 'Furio Scans';
        this.tags = [ 'webtoon', 'portuguese' ];
        this.url = 'https://furioscans.com';
    }
}