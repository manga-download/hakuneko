import WordPressMangastream from './templates/WordPressMangastream.mjs';

export default class MangaSwat extends WordPressMangastream {

    constructor() {
        super();
        super.id = 'mangaswat';
        super.label = 'SWAT Manga';
        this.tags = ['webtoon', 'arabic'];
        this.url = 'https://swatmanga.net';
        this.path = '/manga/list-mode';

        this.queryChapters = 'div.bxcl ul li span.lchx a';
        this.queryChaptersTitle = undefined;
    }

    async _getPages(chapter) {
        const uri = new URL(chapter.id, this.url);
        const request = new Request(uri, this.requestOptions);
        const regex = /ts_reader\.run\(([^)]+)/g;
        let data = await this.fetchRegex(request, regex);
        data = JSON.parse(data[0]);
        return data.sources.shift().images.map(link => this.getAbsolutePath(link, request.url).replace(/\/i\d+\.wp\.com/, '')).filter(link => !link.includes('histats.com'));
    }
}
