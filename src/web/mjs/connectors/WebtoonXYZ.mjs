import WordPressMadara from './templates/WordPressMadara.mjs';

export default class WebtoonXYZ extends WordPressMadara {

    constructor() {
        super();
        super.id = 'webtoonxyz';
        super.label = 'WebtoonXYZ';
        this.tags = [ 'webtoon', 'english' ];
        this.url = 'https://www.webtoon.xyz';

        // NOTE : in case they fix the structure
        this.queryMangas = 'div.post-title h3 a, div.post-title h5 a, div.post-title .h5 a';
    }
}