import WordPressMadara from './templates/WordPressMadara.mjs';

export default class TopManhuaNet extends WordPressMadara {

    constructor() {
        super();
        super.id = 'topmanhuanet';
        super.label = 'Top Manhua net';
        this.tags = [ 'webtoon', 'english' ];
        this.url = 'https://topmanhwa.net';
    }
}