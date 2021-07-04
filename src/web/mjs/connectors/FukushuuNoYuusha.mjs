import WordPressMadara from './templates/WordPressMadara.mjs';

export default class FukushuuNoYuusha extends WordPressMadara {

    constructor() {
        super();
        super.id = 'fnyscantrad';
        super.label = 'Fukushuu no Yuusha';
        this.tags = [ 'manga', 'french' ];
        this.url = 'https://fny-scantrad.com';
    }
}