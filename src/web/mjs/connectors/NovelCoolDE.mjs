import NovelCool from './templates/NovelCool.mjs';

export default class NovelCoolDE extends NovelCool {
    constructor() {
        super();
        super.id = 'novelcool-de';
        super.label = 'Novel Cool (DE)';
        this.tags = [ 'german', 'manga', 'webtoon'];
        this.url = 'https://de.novelcool.com';
        this.links = {
            login: 'https://de.novelcool.com/login.html'
        };
    }
}