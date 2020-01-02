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

    async _getPageList(manga, chapter, callback) {
        try {
            let request = new Request(this.url + chapter.id, this.requestOptions);
            let data = await this.fetchDOM(request, 'script[src*="/wp-content/cache"][data-minify="1"]');
            request = new Request(this.getAbsolutePath(data[0], this.url), this.requestOptions);
            data = await this.fetchRegex(request, /['"]postimg__\d+['"][,\s]+['"]([^'"]+)['"]/g);
            let pageList = data.map(link => this.getAbsolutePath(atob(link), this.url));
            callback(null, pageList);
        } catch(error) {
            console.error(error, chapter);
            callback(error, undefined);
        }
    }
}