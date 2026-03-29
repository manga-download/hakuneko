import WordPressMadara from './templates/WordPressMadara.mjs';

export default class HentaiRead extends WordPressMadara {

    constructor() {
        super();
        super.id = 'hentairead';
        super.label = 'HentaiRead';
        this.tags = [ 'hentai', 'english' ];
        this.url = 'https://hentairead.com';
    }

    async _getChapters(manga) {
        const request = new Request(new URL(manga.id, this.url), this.requestOptions);
        const [ data ] = await this.fetchDOM(request, 'a.btn-read-now');
        return [{
            id : data.pathname,
            title : manga.title
        }];
    }

    async _getPages(chapter) {
        const request = new Request(this.url + chapter.id, this.requestOptions);
        const script = `
            new Promise((resolve, reject) => {
                setTimeout(() => {
                    try {
                        const pagelist  = (window.chapterImages ?? window.chapter_preloaded_images);
                        resolve( pagelist.map(image=> {
                            const uri = new URL(image.src);
                            uri.searchParams.set('quality', '100');
                            uri.searchParams.delete('w');
                            return uri.href;
                        }));
                    } catch (error) {
                        reject(error);
                    }
                },
                500);
            });
        `;
        const pages = await Engine.Request.fetchUI(request, script);
        return pages.map(page => page.replace(/\/i\d+\.wp\.com/, ''));
    }
}
