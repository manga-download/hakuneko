import Novelcool from './templates/Novelcool.mjs';

export default class NovelcoolIT extends Novelcool {
    constructor() {
        super();
        super.id = 'novelcool-it';
        super.label = 'Novel Cool (IT)';
        this.tags = [ 'italian', 'manga', 'webtoon'];
        this.url = 'https://it.novelcool.com';
        this.links = {
            login: 'https://it.novelcool.com/login.html'
        };
    }
}