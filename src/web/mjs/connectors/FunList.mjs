import WordPressMadara from './templates/WordPressMadara.mjs';

export default class FunList extends WordPressMadara {

    constructor() {
        super();
        super.id = 'funlist';
        super.label = 'Funlist Online';
        this.tags = [ 'webtoon', 'english' ];
        this.url = 'https://funlist.online';
    }
}