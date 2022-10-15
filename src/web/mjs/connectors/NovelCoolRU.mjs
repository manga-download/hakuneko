import NovelCool from './templates/NovelCool.mjs';

export default class NovelCoolRU extends NovelCool {
    constructor() {
        super();
        super.id = 'novelcool-ru';
        super.label = 'Novel Cool (RU)';
        this.tags = [ 'russian', 'manga', 'webtoon'];
        this.url = 'https://ru.novelcool.com';
        this.links = {
            login: 'https://ru.novelcool.com/login.html'
        };
    }
}