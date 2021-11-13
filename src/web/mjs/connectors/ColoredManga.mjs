import WordPressMadara from './templates/WordPressMadara.mjs';

export default class ColoredManga extends WordPressMadara {

    constructor() {
        super();
        super.id = 'coloredmanga';
        super.label = 'Colored Manga';
        this.tags = ['manga', 'english'];
        this.url = 'https://coloredmanga.com';
    }
}
