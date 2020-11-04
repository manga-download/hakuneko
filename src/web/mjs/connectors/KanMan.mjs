import MHXK from './templates/MHXK.mjs';

export default class KanMan extends MHXK {

    constructor() {
        super();
        super.id = 'kanman';
        super.label = '看漫画 (KanMan)';
        this.tags = [ 'manga','webtoon', 'Chinese'];
        this.url = 'https://www.kanman.com';

        this.product = {
            id: 1,
            name: 'kmh',
            platform: 'pc'
        };
    }
}
