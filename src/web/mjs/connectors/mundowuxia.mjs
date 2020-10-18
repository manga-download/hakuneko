import WordPressMadara from './templates/WordPressMadara.mjs';

export default class MundoWuxia extends WordPressMadara {

    constructor() {
        super();
        super.id = 'mundowuxia';
        super.label = 'Mundo Wuxia';
        this.tags = [ 'webtoon', 'spanish' ];
        this.url = 'https://mundowuxia.com';
    }
}