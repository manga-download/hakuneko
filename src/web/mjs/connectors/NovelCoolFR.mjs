import NovelCool from './templates/NovelCool.mjs';

export default class NovelCoolFR extends NovelCool {
    constructor() {
        super();
        super.id = 'novelcool-fr';
        super.label = 'Novel Cool (FR)';
        this.tags = [ 'french', 'manga', 'webtoon'];
        this.url = 'https://fr.novelcool.com';
        this.links = {
            login: 'https://fr.novelcool.com/login.html'
        };
    }
}