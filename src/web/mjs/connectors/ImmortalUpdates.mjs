import WordPressMadara from './templates/WordPressMadara.mjs';

export default class ImmortalUpdates extends WordPressMadara {

    constructor() {
        super();
        super.id = 'immortalupdates';
        super.label = 'Immortal Updates';
        this.tags = [ 'webtoon', 'english' ];
        this.url = 'https://mortalsgroove.com';
    }
}
