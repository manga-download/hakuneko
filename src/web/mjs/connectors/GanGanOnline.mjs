import Publus from './templates/Publus.mjs';

export default class GanGanOnline extends Publus {

    constructor() {
        super();
        super.id = 'ganganonline';
        super.label = 'ガンガンONLINE (Gangan Online)';
        this.tags = [ 'manga', 'japanese' ];
        this.url = 'https://www.ganganonline.com';
        this.apiURL = 'https://web-ggo.tokyo-cdn.com';
        this.protoTypes = '/mjs/connectors/GanGanOnline.proto';
        this.rootType = 'GanGanOnline.Response';
    }

    async _getMangas() {
        let mangaList = [];
        for(let page of [
            { path: '/contents/', queryLink: 'div#comicList ul li a.gn_link_cList', queryTitle: 'span.gn_cList_title' }
            /*
             *  archive contains comics + news => need to filter news
             * { path: '/archive/', queryLink: 'div#gn_archive_newestList div.gn_archive_margin a.gn_link_archivelist', queryTitle: 'span.gn_top_whatslist_ttl' }
             */
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
        let request = new Request(new URL(manga.id, this.url), this.requestOptions);
        let response = await fetch(request);
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

    async _getPages(chapter) {
        let uri = new URL(chapter.id, this.url);
        let chapterID = uri.searchParams.get('chapterId');
        if(uri.hostname === 'viewer.ganganonline.com' && chapterID) {
            let request = new Request(new URL('/web_manga_data?chapter_id=' + chapterID, this.apiURL), {
                method: 'POST',
                body: uri.searchParams.toString(),
                headers: {
                    'Content-Type': 'application/octet-stream'
                }
            });
            let data = await this.fetchPROTO(request, this.protoTypes, this.rootType);
            return data.success.webMangaViewer.pages
                .filter(page => !(page.image || page.linkImage).imageUrl.includes('extra_manga_page'))
                .map(page => {
                    let image = page.image || page.linkImage;
                    image = Object.assign(image, { mode: image.encryptionKey ? 'xor' : 'raw' });
                    return image.encryptionKey ? this.createConnectorURI(image) : image.imageUrl;
                });
        } else {
            return super._getPages(chapter);
        }
    }
}