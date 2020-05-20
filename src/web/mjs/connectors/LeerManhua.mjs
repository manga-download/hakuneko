import WordPressMadara from './templates/WordPressMadara.mjs';

export default class LeerManhua extends WordPressMadara {

    constructor() {
        super();
        super.id = 'leermanhua';
        super.label = 'Leermanhua';
        this.tags = [ 'webtoon', 'spanish' ];
        this.url = 'https://leermanhua.com';
    }
}