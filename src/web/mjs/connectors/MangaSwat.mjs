import WordPressMangastream from './templates/WordPressMangastream.mjs';

export default class MangaSwat extends WordPressMangastream {

    constructor() {
        super();
        super.id = 'mangaswat';
        super.label = 'Goldragon (SWAT Manga)';
        this.tags = ['webtoon', 'arabic'];
        this.url = 'https://swatmanhua.com';
        this.path = '/manga/list-mode';

        this.queryChapters = 'div.bxcl ul li span.lchx a';
        this.queryChaptersTitle = undefined;
        this.queryMangas = 'div.soralist ul li a.series';
    }

    async _getPages(chapter) {
        const script = `
           new Promise((resolve, reject) => {
                let t = new RocketLazyLoadScripts;
                t._loadEverythingNow();
                setTimeout(() => {
                    resolve(ts_reader_control.getImages());
                }, 2500);
               });
        `;
        const uri = new URL(chapter.id, this.url);
        let request = new Request(uri, this.requestOptions);
        let data = await Engine.Request.fetchUI(request, script);
        // HACK: bypass 'i0.wp.com' image CDN to ensure original images are loaded directly from host
        return data.map(link => this.getAbsolutePath(link, request.url).replace(/\/i\d+\.wp\.com/, '')).filter(link => !link.includes('histats.com'));
    }
}
