import WordPressMadara from './templates/WordPressMadara.mjs';
export default class Manga1st extends WordPressMadara {
    constructor() {
        super();
        super.id = 'manga1st';
        super.label = 'Manga1st';
        this.tags = [ 'manga', 'webtoon', 'english' ];
        this.url = 'https://manga1st.com';
    }
}