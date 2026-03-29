import WordPressMadara from './templates/WordPressMadara.mjs';

export default class HManhwa extends WordPressMadara {
    constructor() {
        super();
        super.id = 'hmanhwa';
        super.label = 'HManhwa';
        this.tags = [ 'webtoon', 'hentai', 'english', 'korean' ];
        this.url = 'https://hmanhwa.com';
    }
}