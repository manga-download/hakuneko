import WordPressMadara from './templates/WordPressMadara.mjs';

export default class ManhwaClubNet extends WordPressMadara {

    constructor() {
        super();
        super.id = 'manhwaclubnet';
        super.label = 'ManhwaClubNet';
        this.tags = [ 'webtoon', 'hentai', 'multi-lingual' ];
        this.url = 'https://manhwaclub.net';
    }
}
