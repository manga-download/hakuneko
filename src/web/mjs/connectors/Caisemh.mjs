import UserAgent from '../engine/UserAgent.mjs';
import MH from './templates/MH.mjs';

export default class Caisemh extends MH {
    
    constructor() {
        super();
        super.id = 'caisemh';
        super.label = 'Caisemh';
        this.tags = [ 'manga', 'webtoon', 'chinese', 'hentai' ];
        this.url = 'https://www.caisemh.com';

        this.queryPages = 'div#cp_img source';
    }

    async _getPages(chapter) {
        this.requestOptions.headers.set('x-user-agent', 'Mozilla/5.0 (Linux; Android 9; Pixel) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/85.0.4026.0 Mobile Safari/537.36');
        let request = new Request(new URL(chapter.id, this.url), this.requestOptions);
        let data = await this.fetchDOM(request, this.queryPages);
        this.requestOptions.headers.set('x-user-agent', UserAgent.random());
        return data.map(element => this.getAbsolutePath(element.dataset.original || element, request.url));
    }
}