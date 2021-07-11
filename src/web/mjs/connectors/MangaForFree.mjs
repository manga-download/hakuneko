import WordPressMadara from "./templates/WordPressMadara.mjs";

export default class MangaForFree extends WordPressMadara {

    constructor() {
        super();
        super.id = 'mangaforfree';
        super.label = 'MangaForFree';
        this.tags = ['webtoon', 'english', 'hentai'];
        this.url = 'https://mangaforfree.com';
    }
}