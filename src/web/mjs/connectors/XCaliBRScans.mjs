import WordPressMangastream from './templates/WordPressMangastream.mjs';

export default class XCaliBRScans extends WordPressMangastream {

    constructor() {
        super();
        super.id = 'xcalibrscans';
        super.label = 'xCaliBR Scans';
        this.tags = [ 'webtoon', 'english' ];
        this.url = 'https://xcalibrscans.com';
        this.path = '/manga/list-mode/';

        this.config = {
            throttle: {
                label: 'Throttle Requests [ms]',
                description: 'Enter the timespan in [ms] to delay consecuitive HTTP requests.\nThe website may block images for to many consecuitive requests.',
                input: 'numeric',
                min: 1000,
                max: 7500,
                value: 1500
            }
        };
    }
}