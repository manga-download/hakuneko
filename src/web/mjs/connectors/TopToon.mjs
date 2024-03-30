import Connector from '../engine/Connector.mjs';
import Manga from '../engine/Manga.mjs';

export default class TopToon extends Connector {

    constructor() {
        super();
        super.id = 'toptoon';
        super.label = 'TOPTOON (탑툰)';
        this.tags = [ 'webtoon', 'korean' ];
        this.url = 'https://toptoon.com';
        this.links = {
            login: 'https://toptoon.com/login'
        };
    }
    async _getMangaFromURI(uri) {
        const request = new Request(uri, this.requestOptions);
        const data = await this.fetchDOM(request, 'div.ep_comic_info span.comic_tit span');
        return new Manga(this, uri.pathname, data[0].textContent.trim());
    }

    async _getMangas() {
        const req = new Request(new URL('/hashtag', this.url), this.requestOptions);
        const api = await this.fetchRegex(req, /fileUrl\s*:\s*'([^']+)'/g);
        const request = new Request(api[0], this.requestOptions);
        const data = await this.fetchJSON(request);
        return data.map(item => {
            return{
                id: item.meta.comicsListUrl,
                title: item.meta.title
            };
        });
    }

    async _getChapters(manga) {
        const request = new Request(new URL(manga.id, this.url), this.requestOptions);
        const data = await this.fetchDOM(request, 'div.eplist ul a.episode-items');
        return data.map(element => {
            let title = element.querySelector('p.ep_title').textContent.trim();
            const subtitle = element.querySelector('p.ep_stitle');
            title += subtitle && subtitle.textContent.trim() != '' ? ' - ' + subtitle.textContent.trim() : '';
            return {
                id: `/comic/ep_view/${element.dataset.comicId}/${element.dataset.episodeId}`,
                title: title
            };
        });
    }

    async _getPages(chapter) {
        const request = new Request(new URL(chapter.id, this.url), this.requestOptions);
        const data = await this.fetchDOM(request, 'div#viewerContentsWrap source.document_img');
        return data.map(element => this.getAbsolutePath(element.dataset.src || element, request.url));
    }
}
