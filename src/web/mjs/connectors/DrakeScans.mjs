import WordPressMadara from './templates/WordPressMadara.mjs';

export default class DrakeScans extends WordPressMadara {

    constructor() {
        super();
        super.id = 'drakescans';
        super.label = 'DrakeScans';
        this.tags = [ 'webtoon', 'english'];
        this.url = 'https://drakescans.com';
    }
}