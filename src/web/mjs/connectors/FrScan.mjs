import WordPressMadara from './templates/WordPressMadara.mjs';

export default class FrScan extends WordPressMadara {

    constructor() {
        super();
        super.id = 'fr-scan';
        super.label = 'FR-Scan';
        this.tags = [ 'manga', 'webtoon', 'french' ];
        this.url = 'https://fr-scan.com/';
        this.requestOptions.headers.set('x-referer', this.url);
        this.language = 'fr';

        this.queryTitleForURI = 'div.profile-manga div.post-title h1';
    }

    get icon(){
        return '/img/connectors/fr-scan';
    }

    async _getPages(chapter) {
        const request = new Request(new URL(`${chapter.id}`, this.url), this.requestOptions);
        const data = await this.fetchDOM(request, 'div.page-break');
        return data.map(element => {
            let srcUrl = element.innerHTML;
            srcUrl = srcUrl.split('https')[1];
            srcUrl = srcUrl.split('"')[0];
            return `https${srcUrl}`
            });
     }
}