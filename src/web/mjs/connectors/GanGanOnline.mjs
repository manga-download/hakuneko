import Publus from './templates/Publus.mjs';

export default class GanGanOnline extends Publus {

    constructor() {
        super();
        super.id = 'ganganonline';
        super.label = 'ガンガンONLINE (Gangan Online)';
        this.tags = [ 'manga', 'japanese' ];
        this.url = 'https://www.ganganonline.com';

        this.customerScriptPart = `
            if(document.querySelector('script[src*="GanGanOnline_WebViewer"]')) {
                let chapterID = new URL(window.location).searchParams.get('chapterId');
                let response = await fetch('https://web-ggo.tokyo-cdn.com/web_manga_data?chapter_id=' + chapterID, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/octet-stream'
                    }
                });
                let data = await response.arrayBuffer();
                let pageList = parcelRequire.cache.KC6V.exports.Proto.Response.decode(new Uint8Array(data)).success.webMangaViewer.pages;
                pageList = pageList.filter(page => page.image && !page.image.imageUrl.includes('extra_manga_page'));
                pageList = pageList.map(page => Object.assign(page.image/*.linkImage*/, { mode: page.image.encryptionKey ? 'xor' : 'raw' }));
                return resolve(pageList);
            }
        `;
    }

    async _getMangas() {
        let mangaList = [];
        for(let page of [
            { path: '/contents/', queryLink: 'div#comicList ul li a.gn_link_cList', queryTitle: 'span.gn_cList_title' }
            // archive contains comics + news => need to filter news
            //{ path: '/archive/', queryLink: 'div#gn_archive_newestList div.gn_archive_margin a.gn_link_archivelist', queryTitle: 'span.gn_top_whatslist_ttl' }
        ]) {
            let mangas = await this._getMangasFromPage(page);
            mangaList.push(...mangas);
        }
        return mangaList;
    }

    async _getMangasFromPage(page) {
        let request = new Request(new URL(page.path, this.url), this.requestOptions);
        let data = await this.fetchDOM(request, page.queryLink);
        return data.map(element => {
            return {
                id: this.getRootRelativeOrAbsoluteLink(element, this.url),
                title: element.querySelector(page.queryTitle).textContent.trim()
            };
        });
    }

    async _getChapters(manga) {
        let request = new Request(new URL(manga.id, this.url));
        let response = await fetch(request, this.requestOptions);
        let data = await response.text();
        let dom = this.createDOM(data);
        let chapterLatest = dom.querySelector('div.gn_detail_story_list dd ul');
        chapterLatest = {
            id: this.getRootRelativeOrAbsoluteLink(chapterLatest.querySelector('li.gn_detail_story_btn a.gn_link_btn'), this.url),
            title: chapterLatest.querySelector('li.gn_detail_story_list_ttl').textContent.trim(),
            language: 'jp'
        };
        let chapterList = [...dom.querySelectorAll('div.gn_detail_story_past ul.past_2c li.gn_detail_story_past_2c a.gn_link_list')]
            .map(element => {
                return {
                    id: this.getRootRelativeOrAbsoluteLink(element, this.url),
                    title: element.text.trim(),
                    language: 'jp'
                };
            });
        chapterList.push(chapterLatest);
        return chapterList;
    }
}