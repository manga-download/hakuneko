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
        let data = await this.fetchDOM(request, 'h2.detail-ex__title');
        let id = uri.pathname;
        let title = data[0].textContent.trim();
        return new Manga(this, id, title);
    }
    
    async _getMangas() {
        let msg = 'This website does not provide a manga list, please copy and paste the URL containing the chapters directly from your browser into HakuNeko.';
        throw new Error(msg);
    }


    async _getChapters(manga) {
        let request = new Request(new URL(manga.id, this.url), this.requestOptions);
        let data = await this.fetchDOM(request, 'section.detail-sec.detail-ex div.detail-ex__btn-item a');
        return data.map(element => {
            let title = element.querySelector('span');
            return {
                id: this.getRootRelativeOrAbsoluteLink(element, request.url),
                title: title.innerText.replace(manga.title, '').trim(),
                language: ''
            };
        });
    }

}
