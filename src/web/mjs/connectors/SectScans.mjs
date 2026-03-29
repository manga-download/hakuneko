import WordPressMadara from "./templates/WordPressMadara.mjs";

export default class SectScans extends WordPressMadara {
    constructor() {
        super();
        super.id = "sectscans";
        super.label = "Sect Scans";
        this.tags = ["manga", "english", "webtoon", "scanlation"];
        this.url = "https://sectscans.com";
    }
}
