import WordPressMangastream from "./templates/WordPressMangastream.mjs";

export default class RokariComics extends WordPressMangastream {
    constructor() {
        super();
        this.queryChapters = 'div#chapterlist ul li div.eph-num a[href]';
        super.id = "rokaricomics";
        super.label = "Rokari Comics";
        this.tags = ["webtoon", "english"];
        this.path="/manga/list-mode/";
        this.url = "https://rokaricomics.com";
        this.links = {
            login: 'https://rokaricomics.com/login/'
        };
    }
}
