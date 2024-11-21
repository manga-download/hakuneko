import WordPressMadara from "./templates/WordPressMadara.mjs";

export default class NoIndexScan extends WordPressMadara {
    constructor() {
        super();
        super.id = "noindexscan";
        super.label = "No Index Scan";
        this.tags = ["webtoon", "manga", "manhwa", "hentai", "portuguese"];
        this.url = "https://noindexscan.com";
    }
}
