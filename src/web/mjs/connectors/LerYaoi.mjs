import WordPressMadara from './templates/WordPressMadara.mjs';

export default class LerYaoi extends WordPressMadara {

    constructor() {
        super();
        super.id = 'leryaoi';
        super.label = 'LerYaoi';
        this.tags = [ 'manga', 'portuguese', 'webtoon' ];
        this.url = 'https://leryaoi.com';
    }
}