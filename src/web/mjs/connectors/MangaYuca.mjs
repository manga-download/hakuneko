import WordPressMadara from "./templates/WordPressMadara.mjs";

export default class MangaYuca extends WordPressMadara {

    constructor() {
        super();
        super.id = 'mangayuca';
        super.label = 'MangaYuca';
        this.tags = ['webtoon', 'english', 'hentai'];
        this.url = 'https://mangayuca.com';
    }
}