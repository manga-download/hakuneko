import WordPressMadara from './templates/WordPressMadara.mjs';

export default class ManhwaID extends WordPressMadara {

    constructor() {
        super();
        super.id = 'manhwaid';
        super.label = 'Manhwaid';
        this.tags = [ 'manga', 'webtoon', 'hentai', 'indonesian' ];
        this.url = 'https://manhwaid.fun';
    }
}