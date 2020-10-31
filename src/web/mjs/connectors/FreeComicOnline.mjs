import WordPressMadara from './templates/WordPressMadara.mjs';

export default class FreeComicOnline extends WordPressMadara {

    constructor() {
        super();
        super.id = 'freecomiconline';
        super.label = 'Free Comic Online';
        this.tags = [ 'webtoon', 'english' ];
        this.url = 'https://freecomiconline.me';
    }
}