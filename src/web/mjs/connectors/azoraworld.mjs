import WordPressMadara from './templates/WordPressMadara.mjs';

export default class AzoraWorld extends WordPressMadara {

    constructor() {
        super();
        super.id = 'azoraworld';
        super.label = 'AzoraWorld';
        this.tags = [ 'webtoon', 'arabic', 'manga' ];
        this.url = 'https://azoraworld.com';
    }
}
