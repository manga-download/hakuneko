import WordPressMadara from './templates/WordPressMadara.mjs';

export default class ManhwaEighteen extends WordPressMadara {

    constructor() {
        super();
        super.id = 'manhwa18-new';
        super.label = 'Manhwa 18 (.net)';
        this.tags = [ 'hentai', 'english' ];
        this.url = 'https://manhwa18.net';
    }

    // TODO: images not working
}