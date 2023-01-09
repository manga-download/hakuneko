import MadTheme from './templates/MadTheme.mjs';

export default class Manga1001Top extends MadTheme {

    constructor() {
        super();
        super.id = 'manga1001top';
        super.label = 'Manga 1001.top';
        this.tags = [ 'manga', 'webtoon', 'english' ];
        this.url = 'https://manga1001.top';
    }

    async _getChapters(manga) {
        const mangaid = manga.id.split('/').pop();
        const uri = new URL('/api/manga/'+mangaid+'/chapters?source=detail', this.url);
        const request = new Request(uri, this.requestOptions);
        const data = await this.fetchDOM(request, 'li option');
        return data.map(element => {
            return {
                id:  element.value,
                title: element.text.trim()
            };
        });
    }
}
