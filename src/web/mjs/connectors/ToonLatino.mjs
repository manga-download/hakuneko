import WordPressMadara from './templates/WordPressMadara.mjs';

export default class ToonLatino extends WordPressMadara {

    constructor() {
        super();
        super.id = 'toonlatino';
        super.label = 'Toon Latino';
        this.tags = [ 'webtoon', 'spanish' ];
        this.url = 'https://toonlatinoapp.com';
        this.requestOptions.headers.set('x-cookie', 'pll_language=es');
    }
}