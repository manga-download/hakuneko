import WordPressMangastream from './templates/WordPressMangastream.mjs';

export default class YumeKomik extends WordPressMangastream {

    constructor() {
        super();
        super.id = 'yumekomik';
        super.label = 'YumeKomik';
        this.tags = ['manga', 'indonesian'];
        this.url = 'https://yumekomik.com';
        this.path = '/manga/list-mode/';
        this.queryMangaTitleRemove = 'Bahasa Indonesia';
    }

    async _getMangas() {
        let request = new Request(new URL(this.path, this.url), this.requestOptions);
        let data = await this.fetchDOM(request, this.queryMangas);
        return data.map(element => {
            return {
                id: this.getRootRelativeOrAbsoluteLink(element, request.url),
                title: element.title ? element.title.replace(this.queryMangaTitleRemove, '').trim() : element.text.replace(this.queryMangaTitleRemove, '').trim()
            };
        });
    }

    async _getPages(chapter) {
        const script = `
            new Promise((resolve, reject) => {
                resolve(ts_reader_control.getImages());
            });
        `;
        const uri = new URL(chapter.id, this.url);
        let request = new Request(uri, this.requestOptions);
        let data = await Engine.Request.fetchUI(request, script);
        // HACK: bypass 'i0.wp.com' image CDN to ensure original images are loaded directly from host
        return data.map(link => this.getAbsolutePath(link, request.url).replace(/\/i\d+\.wp\.com/, '')).filter(link => !link.includes('histats.com'));
    }

}
