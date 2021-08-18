import WordPressMadara from './templates/WordPressMadara.mjs';

export default class IsekaiScan extends WordPressMadara {

    constructor() {
        super();
        super.id = 'isekaiscan';
        super.label = 'IsekaiScan';
        this.tags = [ 'manga', 'english' ];
        this.url = 'https://isekaiscan.com';
    }

    async _getChapters(manga) {
        const uri = new URL(manga.id + 'ajax/chapters/', this.url);
        const request = new Request(uri, { method: 'POST' });
        const data = await this.fetchDOM(request, this.queryChapters);
        return data.map(element => {
            return {
                id: this.getRootRelativeOrAbsoluteLink(element, this.url),
                title: element.text.trim(),
            };
        });
    }
}