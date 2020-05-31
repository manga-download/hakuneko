import WordPressMadara from './templates/WordPressMadara.mjs';

export default class Hayalistic extends WordPressMadara {

    constructor() {
        super();
        super.id = 'hayalistic';
        super.label = 'Hayalistic';
        this.tags = [ 'webtoon', 'turkish' ];
        this.url = 'https://hayalistic.com';
    }
}