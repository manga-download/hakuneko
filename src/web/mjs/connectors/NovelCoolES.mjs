import Novelcool from './templates/Novelcool.mjs';

export default class NovelcoolES extends Novelcool {
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