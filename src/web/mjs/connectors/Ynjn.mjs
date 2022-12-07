import Manga from '../engine/Manga.mjs';
import SpeedBinb from './templates/SpeedBinb.mjs';

export default class YnJn extends SpeedBinb {

    constructor() {
        super();
        super.id = 'ynjn';
        super.label = 'ヤンジャン！(ynjn)';
        this.tags = ['manga', 'japanese'];
        this.url = 'https://ynjn.jp';
        this.apiUrl = 'https://webapi.ynjn.jp';
    }

    async _getMangaFromURI(uri) {
        const id = uri.pathname.split('/').pop();
        const request = new Request(new URL(`book/${id}`, this.apiUrl), this.requestOptions);
        const json = await this.fetchJSON(request);
        const title = json.data.book.name;
        return new Manga(this, id, title);
    }

    async _getMangas() {
        let msg = 'This website does not provide a manga list, please copy and paste the URL containing the chapters directly from your browser into HakuNeko.';
        throw new Error(msg);
    }

    async _getChapters(manga) {
        const chapters = [];
        for (let page = 1, hasNext = true; hasNext; page++) {
            const uri = new URL(`title/${manga.id}/episode`, this.apiUrl);
            uri.searchParams.set('id', manga.id);
            uri.searchParams.set('page', page);
            uri.searchParams.set('is_reverse', 'false');
            const request = new Request(uri, this.requestOptions);
            const json = await this.fetchJSON(request);
            json.data.episodes.forEach(episode => {
                chapters.push({
                    id: `/viewer/${manga.id}/${episode.id}?cid=${episode.id}`,
                    title: episode.name,
                });
            });
            hasNext = json.data.has_next;
        }
        return chapters;
    }

}
