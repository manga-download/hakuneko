import MojoPortalComic from './templates/MojoPortalComic.mjs';

export default class LxHentai extends MojoPortalComic {

    constructor() {
        super();
        super.id = 'lxhentai';
        super.label = 'LXHENTAI';
        this.tags = [ 'manga', 'hentai', 'vietnamese' ];
        this.url = 'https://lxmanga.cc';

        this.queryMangaTitle = 'head title';
        this.queryChapter = 'div.justify-between ul.overflow-y-auto a';
        this.queryPages = 'div.text-center source.lazy';
        this.path = '/danh-sach?page=';
        this.queryMangasPageCount = 'a.page-link.paging_prevnext.next:last-of-type';
        this.pathMatch = /page=(\d+)/;
        this.queryMangas = 'div.w-full.relative div.p-2.w-full.truncate a.text-ellipsis';
    }

    async _getChapters(manga) {
        let request = new Request(new URL(manga.id, this.url), this.requestOptions);
        let data = await this.fetchDOM(request, this.queryChapter);
        return data.map(element => {
            return {
                id: this.getRootRelativeOrAbsoluteLink(element, request.url),
                title: element.querySelector('span.text-ellipsis').textContent.replace(manga.title, '').trim(),
                language: ''
            };
        });
    }

}
