import NovelCool from './templates/NovelCool.mjs';

export default class NovelCoolBR extends NovelCool {
    constructor() {
        super();
        super.id = 'novelcool-br';
        super.label = 'Novel Cool (BR)';
        this.tags = [ 'portuguese', 'manga', 'webtoon'];
        this.url = 'https://br.novelcool.com';
        this.links = {
            login: 'https://br.novelcool.com/login.html'
        };
    }
}