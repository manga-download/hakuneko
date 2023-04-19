import WordPressMadara from './templates/WordPressMadara.mjs';

export default class Hentai3z extends WordPressMadara {

    constructor() {
        super();
        super.id = 'hentai3z';
        super.label = 'Hentai3z';
        this.tags = [ 'manga', 'webtoon', 'hentai', 'english' ];
        this.url = 'https://hentai3z.xyz';

        this.requestOptions.headers.set('x-referer', this.url);
    }
}
