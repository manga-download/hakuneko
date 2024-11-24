import WordPressMadara from './templates/WordPressMadara.mjs';

export default class NiveraFansub extends WordPressMadara {

    constructor() {
        super();
        super.id = 'niverafansub';
        super.label = 'Nivera Fansub';
        this.tags = [ 'webtoon', 'turkish', 'scanlation' ];
        this.url = 'https://niverafansub.org';
        this.requestOptions.headers.set('x-referer', this.url);
    }
}
