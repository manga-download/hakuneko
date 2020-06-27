import WordPressMadara from './templates/WordPressMadara.mjs';

export default class AngelOfResistance extends WordPressMadara {

    constructor() {
        super();
        super.id = 'angelofresistance';
        super.label = 'Angel Of Resistance (AOR-TR)';
        this.tags = [ 'manga', 'webtoon', 'turkish'];
        this.url = 'https://angelofresistance-tr.com';
        this.requestOptions.headers.set('x-referer', this.url);
    }
}