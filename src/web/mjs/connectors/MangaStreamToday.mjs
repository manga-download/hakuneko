import AnyACG from './templates/AnyACG.mjs';

export default class MangaStreamToday extends AnyACG {

    constructor() {
        super();
        super.id = 'mangastreamtoday';
        super.label = 'MangaStream (by AnyACG)';
        this.tags = [ 'manga', 'webtoon', 'english' ];
        this.url = 'http://readms.today';
    }
}