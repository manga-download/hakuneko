import WordPressMangastream from './templates/WordPressMangastream.mjs';

export default class ManhwaTime extends WordPressMangastream {

    constructor() {
        super();
        super.id = 'manhwatime';
        super.label = 'Manhwa Time';
        this.tags = [ 'webtoon', 'hentai', 'english' ];
        this.url = 'https://manhwatime.xyz';
        this.path = '/manhwa/?list';

        this.queryMangas = 'div.animepost div.animposx > a';
        this.queryChapters = 'div#chapter_list span.lchx a';
        this.queryPages = 'div.reader-area source[src]:not([src=""])';
    }

    async _getMangas() {
        let request = new Request(new URL(this.path, this.url), this.requestOptions);
        let data = await this.fetchDOM(request, this.queryMangas);
        return data.map(element => {
            return {
                id: this.getRootRelativeOrAbsoluteLink(element, request.url),
                title: element.title.trim()
            };
        });
    }
}