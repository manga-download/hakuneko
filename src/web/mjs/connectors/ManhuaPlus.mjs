import WordPressMadara from './templates/WordPressMadara.mjs';

export default class ManhuaPlus extends WordPressMadara {

    constructor() {
        super();
        super.id = 'manhuaplus';
        super.label = 'ManhuaPlus';
        this.tags = [ 'webtoon', 'vietnamese' ];
        this.url = 'https://manhuaplus.com';
    }

    async _getPages(chapter) {
        let request = new Request(new URL(chapter.id, this.url), this.requestOptions);
        let data = await this.fetchDOM(request, 'li.blocks-gallery-item source');
        return data.map(element => this.getAbsolutePath(element, this.url));
    }
}