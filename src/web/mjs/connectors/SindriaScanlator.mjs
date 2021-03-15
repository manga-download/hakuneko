import WordPressMadara from './templates/WordPressMadara.mjs';

export default class SindriaScanlator extends WordPressMadara {

    constructor() {
        super();
        super.id = 'sindriascanlator';
        super.label = 'Sindria Scanlator';
        this.tags = [ 'manga', 'webtoon', 'portuguese' ];
        this.url = 'https://sindriascanlator.com';
    }
}