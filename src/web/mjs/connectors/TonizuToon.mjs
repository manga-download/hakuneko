import WordPressMadara from './templates/WordPressMadara.mjs';

export default class TonizuToon extends WordPressMadara {

    constructor() {
        super();
        super.id = 'tonizutoon';
        super.label = 'Tonizu Toon';
        this.tags = [ 'webtoon', 'turkish', 'scanlation' ];
        this.url = 'https://tonizu.xyz';
        this.requestOptions.headers.set('x-referer', this.url);
    }
}
