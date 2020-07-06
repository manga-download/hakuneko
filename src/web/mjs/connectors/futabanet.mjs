import SpeedBinb from './templates/SpeedBinb.mjs';
import Manga from '../engine/Manga.mjs';

export default class futabanet extends SpeedBinb {

    constructor() {
        super();
        super.id = 'futabanet';
        super.label = 'がうがうモンスター (Futabanet Monster)';
        this.tags = [ 'manga', 'japanese' ];
        this.url = 'https://futabanet.jp';
    }

    async _getMangaFromURI(uri) {
        let request = new Request(uri, this.requestOptions);
        let data = await this.fetchDOM(request, 'head title');
        let id = uri.pathname;
        let title = data[0].text.split(' | ')[0].trim();
        return new Manga(this, id, title);
    }

    /**
     *
     */
    _getMangaList( callback ) {
        // https://futabanet.jp/list/monster/works?page=1 
        let msg = 'Manga list feature is not yet implemented for this website, please copy and paste the links containing the chapters directly from your browser into HakuNeko.';
        callback( new Error( msg ), undefined );
    }


    async _getChapters(manga) {
        let request = new Request(new URL(manga.id, this.url), this.requestOptions);
        let data = await this.fetchDOM(request, 'section.detail-sec.detail-ex div.detail-ex__btn-item a');
        return data.map(element => {
            let title = element.parentElement.querySelector('div.detail-ex__btn-item a span');
            return {
                id: this.getRootRelativeOrAbsoluteLink(element, request.url),
                title: title.innerText.replace(manga.title, '').trim(),
                language: ''
            };
        });
    }

}
