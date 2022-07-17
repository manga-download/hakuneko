import WordPressMadara from './templates/WordPressMadara.mjs';

export default class YaoiFanClube extends WordPressMadara {

    constructor() {
        super();
        super.id = 'yaoifanclube';
        super.label = 'Yaoi Fan Clube';
        this.tags = [ 'webtoon', 'hentai', 'portuguese' ];
        this.url = 'https://yaoifanclube2.com';
    }
}