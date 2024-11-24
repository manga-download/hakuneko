import MadTheme from './templates/MadTheme.mjs';

export default class ManhuaScan extends MadTheme {

    constructor() {
        super();
        super.id = 'manhuascan';
        super.label = 'KaliScan';
        this.tags = ['manga', 'webtoon', 'hentai', 'multi-lingual'];
        this.url = 'https://kaliscan.io';
        this.requestOptions.headers.set('x-referer', this.url + '/');
    }

    async _getChapters(manga) {
        const mangaid = manga.id.match(/\/manga\/(\d+)-/)[1];
        const uri = new URL(`/service/backend/chaplist/?manga_id=${mangaid}`, this.url);
        const request = new Request(uri, this.requestOptions);
        const data = await this.fetchDOM(request, 'ul.chapter-list li a');
        return data.map(element => {
            return {
                id: this.getRootRelativeOrAbsoluteLink(element, this.url),
                title: element.querySelector(this.queryChapterTitle).textContent.trim()
            };
        });
    }
}
