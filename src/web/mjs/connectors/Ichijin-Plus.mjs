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
        this.apikey = 'GGXGejnSsZw-IxHKQp8OQKHH-NDItSbEq5PU0g2w1W4=';
        this.requestOptions.headers.set('X-API-Environment-Key', this.apikey);
    }
}
