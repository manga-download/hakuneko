import WordPressMadara from './templates/WordPressMadara.mjs';

export default class MangaSpark extends WordPressMadara {

    constructor() {
        super();
        super.id = 'mangaspark';
        super.label = 'مانجا سبارك (MangaSpark)';
        this.tags = [ 'manga', 'webtoon', 'arabic' ];
        this.url = 'https://mangaspark.com';
    }

    async _initializeConnector() {
        const paths = [ '/', '/manga/_/_/?style=list' ];
        for(let path of paths) {
            const uri = new URL(path, this.url);
            const request = new Request(uri, this.requestOptions);
            await Engine.Request.fetchUI(request, '', 60000, true);
        }
    }
}