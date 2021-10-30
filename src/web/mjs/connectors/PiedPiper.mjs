import WordPressMadara from './templates/WordPressMadara.mjs';
//dead?
export default class PiedPiper extends WordPressMadara {

    constructor() {
        super();
        super.id = 'piedpiperfb';
        super.label = 'Pied Piper';
        this.tags = [ 'manga', 'webtoon', 'turkish' ];
        this.url = 'https://piedpiperfansub.com';
    }
}
