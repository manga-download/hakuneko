import WordPressMangaStream from './templates/WordPressMangaStream.mjs';

export default class IrisScanlator extends WordPressMangaStream {

    constructor() {
        super();
        super.id = 'irisscanlator';
        super.label = 'Iris Scanlator';
        this.tags = [ 'manga', 'webtoon', 'portuguese' ];
        this.url = 'https://irisscanlator.com.br';
        this.path = '/manga/list-mode/';
    }
}
