import WordPressEManga from './templates/WordPressEManga.mjs';

export default class Kyuroku extends WordPressEManga {

    constructor() {
        super();
        super.id = 'kyuroku';
        super.label = 'Kyuroku';
        this.tags = [ 'manga', 'indonesian' ];
        this.url = 'https://kyuroku.com';
        this.path = '/manga/?list';

        this.queryMangas = 'div.cpp div.daftarkartun div.jdlbar ul li a.tip';
        this.queryChapters = 'div.bxcl ul li span.lchx a';
    }

    async _getPages(chapter) {
        let request = new Request(new URL(chapter.id, this.url), this.requestOptions);
        let data = await this.fetchDOM(request, 'script[src*="/wp-content/cache"][data-minify="1"]');
        request = new Request(this.getAbsolutePath(data[0], this.url), this.requestOptions);
        data = await this.fetchRegex(request, /['"]postimg__\d+['"][,\s]+['"]([^'"]+)['"]/g);
        return data.map(link => this.getAbsolutePath(atob(link), this.url));
    }
}