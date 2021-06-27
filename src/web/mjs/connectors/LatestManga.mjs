import WordPressMadara from './templates/WordPressMadara.mjs';

export default class LatestManga extends WordPressMadara {

    constructor() {
        super();
        super.id = 'topmanhuanet';
        super.label = 'LatestManga';
        this.tags = [ 'webtoon', 'english' ];
        this.url = 'https://latestmanga.net';
    }
}