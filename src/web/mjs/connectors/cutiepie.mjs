import WordPressMadara from './templates/WordPressMadara.mjs';

export default class CutiePie extends WordPressMadara {

    constructor() {
        super();
        super.id = 'cutiepie';
        super.label = 'Cutie Pie';
        this.tags = [ 'webtoon', 'turkish' ];
        this.url = 'https://cutiepie.ga';
    }
}