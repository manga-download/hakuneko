import WordPressMadara from './templates/WordPressMadara.mjs';

export default class ShiraiScans extends WordPressMadara {

    constructor() {
        super();
        super.id = 'shiraiscans';
        super.label = 'Shirai Scans';
        this.tags = [ 'manga', 'portuguese', 'scanlation' ];
        this.url = 'https://shiraiscans.com.br';
    }
}