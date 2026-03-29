import WordPressMadara from './templates/WordPressMadara.mjs';

export default class HentaiZone extends WordPressMadara {

    constructor() {
        super();
        super.id = 'hentaizone';
        super.label = 'HentaiZone';
        this.tags = [ 'webtoon', 'hentai', 'french' ];
        this.url = 'https://hentaizone.xyz';
    }
}