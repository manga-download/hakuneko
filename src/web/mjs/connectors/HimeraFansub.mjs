import WordPressMadara from './templates/WordPressMadara.mjs';

export default class HimeraFansub extends WordPressMadara {

    constructor() {
        super();
        super.id = 'himerafansub';
        super.label = 'Himera Fansub';
        this.tags = [ 'manga', 'webtoon', 'turkish'];
        this.url = 'http://himerafansub.com/';
        this.requestOptions.headers.set('x-referer', this.url);
    }
}