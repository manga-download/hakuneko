import WordPressMadara from './templates/WordPressMadara.mjs';

export default class Helllunatoon extends WordPressMadara {

    constructor() {
        super();
        super.id = 'helllunatoon';
        super.label = 'Helllunatoon';
        this.tags = [ 'webtoon', 'turkish', 'scanlation' ];
        this.url = 'https://hellunatoon.fun';
        this.requestOptions.headers.set('x-referer', this.url);
    }
}