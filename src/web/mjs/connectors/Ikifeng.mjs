import WordPressMadara from './templates/WordPressMadara.mjs';

export default class Ikifeng extends WordPressMadara {
    constructor() {
        super();
        super.id = "ikifeng";
        super.label = "Ikifeng";
        this.tags = ["manga", "webtoon", "hentai", "spanish"];
        this.url = "https://ikifeng.com";
    }

    canHandleURI(uri) {
        return /https?:\/\/ikifeng\.com/.test(uri.origin);
    }
}
