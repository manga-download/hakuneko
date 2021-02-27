import Novelcool from './templates/Novelcool.mjs';

export default class NovelcoolDE extends Novelcool {
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