import WordPressMadara from './templates/WordPressMadara.mjs';

export default class GateAnimeManga extends WordPressMadara {

    constructor() {
        super();
        super.id = 'gateanimemanga';
        super.label = 'GateAnimeMANGA';
        this.tags = [ 'manga', 'webtoon', 'arabic' ];
        this.url = 'https://manga.gateanime.com';
    }
}