import WordPressMadara from './templates/WordPressMadara.mjs';

export default class AnshScans extends WordPressMadara {

    constructor() {
        super();
        super.id = 'anshscans';
        super.label = 'AnshScans';
        this.tags = [ 'webtoon', 'english', 'scanlation' ];
        this.url = 'https://anshscans.org';
        this.requestOptions.headers.set('x-referer', this.url);
    }
}