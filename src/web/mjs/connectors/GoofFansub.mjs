import WordPressMadara from './templates/WordPressMadara.mjs';

export default class GoofFansub extends WordPressMadara {

    constructor() {
        super();
        super.id = 'gooffansub';
        super.label = 'Goof Fansub';
        this.tags = [ 'hentai', 'high-quality', 'portuguese', 'scanlation' ];
        this.url = 'https://gooffansub.com.br';
    }
}