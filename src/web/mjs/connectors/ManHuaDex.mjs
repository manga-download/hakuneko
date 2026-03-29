import WordPressMadara from './templates/WordPressMadara.mjs';

export default class ManHuaDex extends WordPressMadara {

    constructor() {
        super();
        super.id = 'manhuadex';
        super.label = 'ManHuaDex';
        this.tags = [ 'manga', 'webtoon', 'english' ];
        this.url = 'https://manhuadex.com';
    }
}