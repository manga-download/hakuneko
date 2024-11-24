import MadTheme from './templates/MadTheme.mjs';

export default class Manga1001Top extends MadTheme {

    constructor() {
        super();
        super.id = 'manga1001top';
        super.label = 'Manga 1001.top';
        this.tags = [ 'manga', 'webtoon', 'english' ];
        this.url = 'https://manga1001.top';
    }

}
