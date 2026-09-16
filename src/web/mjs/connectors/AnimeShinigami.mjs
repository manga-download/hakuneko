import WordPressMadara from './templates/WordPressMadara.mjs';

export default class AnimeShinigami extends WordPressMadara {

    constructor() {
        super();
        super.id = 'animeshinigami';
        super.label = 'AnimeShinigami';
        this.tags = [ 'manga', 'webtoon', 'italian' ];
        this.url = 'https://www.animeshinigami.com';
    }
}