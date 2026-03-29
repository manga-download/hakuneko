import MH from './templates/MH.mjs';

export default class RoozFun extends MH {

    constructor() {
        super();
        super.id = 'roozfun';
        super.label = '腐漫画网 (RoozFun)';
        this.tags = [ 'webtoon', 'chinese' ];
        this.url = 'https://www.roozfun.com';
    }
}