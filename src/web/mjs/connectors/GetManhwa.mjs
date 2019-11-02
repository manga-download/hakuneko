import WordPressMadara from './templates/WordPressMadara.mjs';

export default class GetManhwa extends WordPressMadara {

    constructor() {
        super();
        super.id = 'getmanhwa';
        super.label = 'GetManhwa';
        this.tags = [ 'webtoon', 'english' ];
        this.url = 'https://getmanhwa.co';
    }
}