import WordPressMadara from './templates/WordPressMadara.mjs';

export default class ToonilyNet extends WordPressMadara {

    constructor() {
        super();
        super.id = 'toonilynet';
        super.label = 'Toonily.net';
        this.tags = [ 'webtoon', 'english' ];
        this.url = 'https://toonily.net';
    }
}