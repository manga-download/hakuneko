import WordPressMadara from './templates/WordPressMadara.mjs';

export default class ZinManga extends WordPressMadara {

    constructor() {
        super();
        super.id = 'renascencescans';
        super.label = 'RenascenceScans';
        this.tags = [ 'manga', 'high-quality', 'english', 'scanlation' ];
        this.url = 'https://new.renascans.com';
    }
}