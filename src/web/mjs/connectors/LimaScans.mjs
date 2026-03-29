import WordPressMadara from './templates/WordPressMadara.mjs';

export default class LimaScans extends WordPressMadara {

    constructor() {
        super();
        super.id = 'limascans';
        super.label = 'Lima Scans';
        this.tags = [ 'webtoon', 'portuguese' ];
        this.url = 'http://limascans.xyz';
        this.path = '/v2';
    }
}