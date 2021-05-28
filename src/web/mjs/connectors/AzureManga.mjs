import WordPressMangastream from './templates/WordPressMangastream.mjs';

export default class AzureManga extends WordPressMangastream {

    constructor() {
        super();
        super.id = 'azuremanga';
        super.label = 'Azure Manga';
        this.tags = [ 'webtoon', 'english' ];
        this.url = 'https://azuremanga.com';
        this.path = '/manga/list-mode/';
    }
}