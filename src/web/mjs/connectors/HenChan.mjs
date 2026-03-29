import MangaChan from './MangaChan.mjs';

export default class HenChan extends MangaChan {

    constructor() {
        super();
        super.id = 'henchan';
        super.label = 'Хентай-тян! (Hentai-chan)';
        this.tags = [ 'hentai', 'russian' ];
        this.url = 'https://y.hentaichan.live';
        this.path = '/manga/new';
        this.queryChapters = 'div#manga_images a';
        this.queryPages = 'data.fullimg';
    }

    async _getChapters(manga) {
        const uri = new URL(manga.id, this.url);
        const request = new Request(uri, this.requestOptions );
        const data = await this.fetchDOM(request, this.queryChapters );
        return data.map(element => {
            return {
                id: this.getRootRelativeOrAbsoluteLink(element, this.url),
                title: element.title.replace(manga.title, '').trim().replace('Читать онлайн', manga.title),
                language: 'ru'
            };
        });
    }

}