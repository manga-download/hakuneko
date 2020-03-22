import WordPressMadara from './templates/WordPressMadara.mjs';

export default class ManhwaHand extends WordPressMadara {

    constructor() {
        super();
        super.id = 'manhwahand';
        super.label = 'ManhwaHand';
        this.tags = [ 'hentai', 'korean' ];
        this.url = 'https://manhwahand.com';
    }
}