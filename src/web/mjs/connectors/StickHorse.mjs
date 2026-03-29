import WordPressMadara from './templates/WordPressMadara.mjs';

export default class StickHorse extends WordPressMadara {

    constructor() {
        super();
        super.id = 'stickhorse';
        super.label = 'Stick Horse';
        this.tags = [ 'manga', 'webtoon', 'comic', 'spanish' ];
        this.url = 'https://www.stickhorse.cl';
    }
}