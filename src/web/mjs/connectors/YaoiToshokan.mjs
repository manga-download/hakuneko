import WordPressMadara from './templates/WordPressMadara.mjs';

export default class YaoiToshokan extends WordPressMadara {

    constructor() {
        super();
        super.id = 'yaoitoshokan';
        super.label = 'Yaoi Toshokan';
        this.tags = [ 'hentai', 'high-quality', 'portuguese', 'scanlation' ];
        this.url = 'https://www.yaoitoshokan.com.br';
    }
}