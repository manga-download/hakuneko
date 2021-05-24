import WordPressMadara from './templates/WordPressMadara.mjs';

export default class ThreeQueensScanlator extends WordPressMadara {

    constructor() {
        super();
        super.id = 'threequeensscanlator';
        super.label = 'Three Queens Scanlator';
        this.tags = [ 'webtoon', 'high-quality', 'portuguese', 'scanlation' ];
        this.url = 'https://tqscan.com.br';
    }
}