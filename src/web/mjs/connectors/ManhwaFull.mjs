import WordPressMadara from './templates/WordPressMadara.mjs';

export default class ManhwaFull extends WordPressMadara {

    constructor() {
        super();
        super.id = 'manhwafull';
        super.label = 'ManhwaFull';
        this.tags = [ 'webtoon', 'english' ];
        this.url = 'https://manhwafull.com';
    }
}