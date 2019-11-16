import WordPressMadara from './templates/WordPressMadara.mjs';

export default class MuchoDoujins extends WordPressMadara {

    constructor() {
        super();
        super.id = 'muchodoujins';
        super.label = 'MuchoDoujins';
        this.tags = [ 'hentai', 'english' ];
        this.url = 'https://muchodoujins.com';
    }

    async _getPages(chapter) {
        let uri = new URL(chapter.id, this.url);
        uri.searchParams.set('style', 'list');
        let request = new Request(uri, this.requestOptions);
        let data = await this.fetchDOM(request, this.queryPages);
        return data.map(element => this.createConnectorURI({
            url: this.getAbsolutePath(element.dataset['src'] || element, request.url),
            referer: request.url
        }));
    }
}