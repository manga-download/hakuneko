import MangaYosh from './MangaYosh.mjs';

export default class DoujinYosh extends MangaYosh {

    constructor() {
        super();
        super.id = 'doujinyosh';
        super.label = 'DoujinYosh';
        this.tags = [ 'hentai', 'indonesian' ];
        this.url = 'https://doujinyosh.fun';
    }
}