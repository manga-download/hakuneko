import FlatManga from './templates/FlatManga.mjs';

export default class TruyenChapVn extends FlatManga {

    constructor() {
        super();
        super.id = 'truyenchapvn';
        super.label = 'TruyenChap.vn';
        this.tags = ['vietnamese', 'manga' ];
        this.url = 'https://truyen.chap.vn';
    }
}
