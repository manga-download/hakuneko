import WordPressMadara from './templates/WordPressMadara.mjs';

export default class ScamberTraslator extends WordPressMadara {

    constructor() {
        super();
        super.id = 'scambertraslator';
        super.label = 'ScamberTraslator';
        this.tags = [ 'webtoon', 'spanish', 'scanlation' ];
        this.url = 'https://scambertraslator.com';
        this.requestOptions.headers.set('x-referer', this.url);
    }
}