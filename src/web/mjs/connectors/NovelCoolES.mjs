import NovelCool from './templates/NovelCool.mjs';

export default class NovelCoolES extends NovelCool {
    constructor() {
        super();
        super.id = 'novelcool-es';
        super.label = 'Novel Cool (ES)';
        this.tags = [ 'spanish', 'manga', 'webtoon'];
        this.url = 'https://es.novelcool.com';
        this.links = {
            login: 'https://es.novelcool.com/login.html'
        };
    }
}