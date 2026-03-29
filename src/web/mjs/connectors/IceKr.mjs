import SinMH from './templates/SinMH.mjs';

export default class IceKr extends SinMH {

    constructor() {
        super();
        super.id = 'icekr';
        super.label = '冰氪漫画 (iceKr)';
        this.tags = [ 'manga', 'webtoon', 'chinese' ];
        this.url = 'https://www.icekr.com';
        this.requestOptions.headers.set( 'x-referer', this.url );
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
