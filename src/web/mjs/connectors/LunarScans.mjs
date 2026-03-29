import WordPressMangastream from "./templates/WordPressMangastream.mjs";

export default class LunarScans extends WordPressMangastream {
    constructor() {
        super();
        super.id = "lunarscans";
        super.label = "Lunar Scans";
        this.tags = ["webtoon", "english", "scanlation", "hentai"];
        this.url = "https://lunarscan.org";
        this.path = "/series/list-mode/";
    }
}
