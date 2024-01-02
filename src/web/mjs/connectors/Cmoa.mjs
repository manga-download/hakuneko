import SpeedBinb from './templates/SpeedBinb.mjs';
import Manga from '../engine/Manga.mjs';

export default class Cmoa extends SpeedBinb {

    constructor() {
        super();
        super.id = 'cmoa';
        super.label = 'コミックシーモア (Cmoa)';
        this.tags = ['manga', 'japanese'];
        this.url = 'https://www.cmoa.jp';
    }

    async _getMangaFromURI(uri) {
        const request = new Request(uri, this.requestOptions);
        const dom = await this.fetchDOM(request);
        const id = dom.querySelector('#GA_this_page_title_id').textContent.trim();
        const title = dom.querySelector('#GA_this_page_title_name').textContent.trim();
        return new Manga(this, `/title/${id}/`, title);
    }

    async _getMangas() {
        let msg = 'This website does not provide a manga list, please copy and paste the URL containing the chapters directly from your browser into HakuNeko.';
        throw new Error(msg);
    }

    async _getChapters(manga) {
        const request = new Request(new URL(manga.id, this.url), this.requestOptions);
        const pages = await this.fetchDOM(request, '#comic_list > .pagination:nth-child(1) li:nth-last-child(2) a');
        const chapters = [];
        const totalPage = pages.length == 0 ? 1 : parseInt(new URL(pages[0].href).searchParams.get('page'));

        for (let i = 0; i < totalPage; i++) {
            const uri = new URL(manga.id, this.url);
            uri.searchParams.set('page', i + 1);
            const pageRequest = new Request(uri, this.requestOptions);
            const data = await this.fetchDOM(pageRequest, '.title_vol_vox_vols .title_vol_vox_vols_i');
            for (const element of data) {
                const chapterLink = element.querySelector('a[href^="/reader/"]');
                if (!chapterLink) {
                    continue;
                }
                const chapterUrl = new URL(chapterLink.href, this.url);
                const id = chapterUrl.searchParams.get('content_id');
                const u0 = chapterUrl.pathname.startsWith('/reader/sample') ? 1 : 0;
                const title = element.querySelector('.title_details_title_name_h2').textContent.trim();
                chapters.push({
                    id: `/bib/speedreader/?cid=${id.slice(1, 11)}_jp_${id.slice(11, 15)}&u0=${u0}&u1=0`,
                    title: title.replace('NEW\n', '').trim(),
                });
            }
        }
        return chapters;
    }
}
