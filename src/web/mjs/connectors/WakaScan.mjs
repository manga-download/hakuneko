import WordPressMadara from './templates/WordPressMadara.mjs';

export default class WakaScan extends WordPressMadara {

    constructor() {
        super();
        super.id = 'wakascan';
        super.label = 'WAKASCAN';
        this.tags = [ 'manga', 'french' ];
        this.url = 'http://wakascan.com';
    }
}