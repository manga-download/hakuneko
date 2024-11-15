import WordPressMadara from "./templates/WordPressMadara.mjs";

export default class ImperioDaBritannia extends WordPressMadara {
    constructor() {
        super();
        super.id = "imperiodabritannia";
        super.label = "Imperio Da Britannia";
        this.tags = ["webtoon", "manhwa", "portuguese", "scanlation"];
        this.url = "https://imperiodabritannia.com";
    }
}
