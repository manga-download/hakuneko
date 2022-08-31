import NovelCool from './templates/NovelCool.mjs';

export default class NovelCoolEN extends NovelCool {
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