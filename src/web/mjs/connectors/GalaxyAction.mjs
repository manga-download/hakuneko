import WordPressMangastream from './templates/WordPressMangastream.mjs';

export default class GalaxyAction extends WordPressMangastream {

    constructor() {
        super();
        super.id = 'galaxyaction';
        super.label = 'Galaxy Action';
        this.tags = ['webtoon', 'arabic', 'scanlation'];
        this.url = 'https://galaxyaction.site';
        this.path = '/manga/list-mode/';
    }
}