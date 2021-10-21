import WordPressMadara from './templates/WordPressMadara.mjs';

export default class MiradScanlator extends WordPressMadara {

    constructor() {
        super();
        super.id = 'miradscanlator';
        super.label = 'Mirad Scanlator';
        this.tags = [ 'manga', 'webtoon', 'portuguese', 'scanlation', 'hentai' ];
        this.url = 'https://miradscanlator.site';
    }
}