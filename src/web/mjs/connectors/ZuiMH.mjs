import SinMH from './templates/SinMH.mjs';

export default class ZuiMH extends SinMH {

    constructor() {
        super();
        super.id = 'zuimh';
        super.label = '最漫画 (ZuiMH)';
        this.tags = [ 'manga', 'webtoon', 'chinese' ];
        this.url = 'https://www.zuimh.com';
        this.config = {
            throttle: {
                label: 'Page Throttle Requests [ms]',
                description: 'Enter the timespan in [ms] to delay consecuitive HTTP requests while downloading Pages.\nThe website may ban your IP for to many consecuitive requests.',
                input: 'numeric',
                min: 500,
                max: 10000,
                value: 2500
            }
        };
    }
}