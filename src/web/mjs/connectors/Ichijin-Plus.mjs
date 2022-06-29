import ToCoronaEx from "./To-Corona-Ex.mjs";

export default class IchijinPlus extends ToCoronaEx {
    constructor() {
        super();
        super.id = "ichijin-plus";
        super.label = "一迅プラス (Ichijin Plus)";
        this.tags = ["manga", "webtoon", "japanese"];
        this.url = "https://ichijin-plus.com";
        this.apiurl = 'https://api.ichijin-plus.com';
        this.cdnurl = 'https://cdn.ichijin-plus.com';
    }
}