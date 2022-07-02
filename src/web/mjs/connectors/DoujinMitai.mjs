import WordPressMangastream from './templates/WordPressMangastream.mjs';

export default class DoujinMitai extends WordPressMangastream {

    constructor() {
        super();
        super.id = 'doujinmitai';
        super.label = 'DoujinMitai';
        this.tags = [ 'hentai', 'english' ];
        this.url = 'https://doujinmitai.com';
        this.path = '/manga/list-mode/';
    }
}