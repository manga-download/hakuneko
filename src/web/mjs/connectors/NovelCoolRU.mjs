import Novelcool from './templates/Novelcool.mjs';

export default class NovelcoolRU extends Novelcool {
    constructor() {
        super();
        super.id = 'novelcool-ru';
        super.label = 'Novel Cool (RU)';
        this.tags = [ 'russian', 'manga', 'webtoon'];
        this.url = 'https://ru.novelcool.com';
    }
}