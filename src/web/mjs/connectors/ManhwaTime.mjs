import WordPressMadara from './templates/WordPressMadara.mjs';

export default class ManhwaTime extends WordPressMadara {

    constructor() {
        super();
        super.id = 'manhwatime';
        super.label = 'Manhwa Time';
        this.tags = [ 'webtoon', 'hentai', 'english' ];
        this.url = 'https://manhwatime.xyz';
    }
}