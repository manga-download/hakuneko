import WordPressMadara from './templates/WordPressMadara.mjs';

export default class TwilightScans extends WordPressMadara {

    constructor() {
        super();
        super.id = 'twilightscans';
        super.label = 'Twilight Scans';
        this.tags = [ 'webtoon', 'english' ];
        this.url = 'https://twilightscans.com';
    }
}