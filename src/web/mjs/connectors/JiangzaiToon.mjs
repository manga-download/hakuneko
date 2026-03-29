import WordPressMadara from './templates/WordPressMadara.mjs';

export default class JiangzaiToon extends WordPressMadara {

    constructor() {
        super();
        super.id = 'jiangzaitoon';
        super.label = 'Jiangzaitoon';
        this.tags = [ 'webtoon', 'hentai', 'turkish' ];
        this.url = 'https://jiangzaitoon.dev';
    }
}
