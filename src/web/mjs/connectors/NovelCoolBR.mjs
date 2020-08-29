import Novelcool from './templates/Novelcool.mjs';

export default class NovelcoolBR extends Novelcool {
    constructor() {
        super();
        super.id = 'novelcool-br';
        super.label = 'Novel Cool (BR)';
        this.tags = [ 'portuguese', 'manga', 'webtoon'];
        this.url = 'https://br.novelcool.com';
    }
}