import WordPressMadara from './templates/WordPressMadara.mjs';

export default class XunScans extends WordPressMadara {

    constructor() {
        super();
        super.id = 'xunscans';
        super.label = 'XuNScans';
        this.tags = [ 'manga', 'english', 'scanlation' ];
        this.url = 'https://reader.xunscans.xyz';
    }
}