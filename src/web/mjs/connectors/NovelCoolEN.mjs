import Novelcool from './templates/Novelcool.mjs';

export default class NovelcoolEN extends Novelcool {
    constructor() {
        super();
        super.id = 'novelcool-en';
        super.label = 'Novel Cool (EN)';
        this.tags = [ 'english', 'manga', 'webtoon'];
        this.url = 'https://www.novelcool.com';
        this.links = {
            login: 'https://novelcool.com/login.html'
        };
    }
}