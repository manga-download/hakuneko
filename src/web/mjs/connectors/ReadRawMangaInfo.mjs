import WordPressJarida from './templates/WordPressJarida.mjs';

export default class ReadRawMangaInfo extends WordPressJarida {

    constructor() {
        super();
        super.id = 'readrawmangainfo';
        super.label = 'ReadRawManga (Info)';
        this.tags = [ 'webtoon', 'english' ];
        this.url = 'https://readrawmanga.info';
    }
}