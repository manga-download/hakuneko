import WordPressMadara from './templates/WordPressMadara.mjs';

export default class IrisScanlator extends WordPressMadara {

    constructor() {
        super();
        super.id = 'irisscanlator';
        super.label = 'Iris Scanlator';
        this.tags = [ 'manga', 'webtoon', 'portuguese' ];
        this.url = 'https://irisscanlator.com';
    }
}