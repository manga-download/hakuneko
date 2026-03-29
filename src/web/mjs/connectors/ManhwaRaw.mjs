import WordPressMadara from './templates/WordPressMadara.mjs';

export default class ManhwaRaw extends WordPressMadara {

    constructor() {
        super();
        super.id = 'manhwaraw';
        super.label = 'Manhwa Raw';
        this.tags = [ 'hentai', 'english' ];
        this.url = 'https://manhwaraw.com';
    }
}