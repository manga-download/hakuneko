import Connector from '../engine/Connector.mjs';
import Manga from '../engine/manga.mjs';

export default class TopToon extends Connector {

    constructor() {
        super();
        super.id = 'toptoon';
        super.label = 'TOPTOON (탑툰)';
        this.tags = [ 'webtoon', 'korean' ];
        this.url = 'https://toptoon.com';
    }
    async _getMangaFromURI(uri) {
        const request = new Request(uri, this.requestOptions);
        const data = await this.fetchDOM(request, 'div.ver02 .tit_toon');
        const id = uri.pathname + uri.search;
        const title = data[0].textContent.trim();
        return new Manga(this, id, title);
    }

    async _getMangas() {
        const request = new Request('https://fastidious.toptoon.com/production/comicTotal/504656797d23c25a58c9e6e4890ffeefb0e930abbb449df40ca641736117818e.json', this.requestOptions);
        const data = await this.fetchJSON(request);
        return data.map(ele => {
            return{
                id: ele.meta.comicsListUrl,
                title: ele.meta.title
            };
        });
    }

    async _getChapters(manga) {
        const request = new Request(new URL(manga.id, this.url), this.requestOptions);
        const data = await this.fetchDOM(request, 'tr.episode_tr');
        return data.map(ele => {
            return {
                id: this.getRootRelativeOrAbsoluteLink(`/comic/ep_view/${ele.getAttribute('data-comic-id')}/${ele.getAttribute('data-episode-id')}`, this.url),
                title: ele.getAttribute('data-episode-title').trim()
            };
        });
    }

    async _getPages(chapter) {
        const request = new Request(new URL(chapter.id, this.url), this.requestOptions);
        const data = await this.fetchDOM(request, '#viewerContentsWrap > div > source');
        return data.map(element => this.getAbsolutePath(element.src, request.url));
    }
}