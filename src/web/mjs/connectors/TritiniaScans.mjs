import WordPressMadara from './templates/WordPressMadara.mjs';

export default class TritiniaScans extends WordPressMadara {

    constructor() {
        super();
        super.id = 'tritiniascans';
        super.label = 'Tritinia Scans';
        this.tags = [ 'webtoon', 'high-quality', 'english', 'scanlation' ];
        this.url = 'https://tritiniaman.ga';
    }

    async _getMangas() {
        let request = new Request(new URL('/manga/index.html', this.url), this.requestOptions);
        let data = await this.fetchDOM(request, 'div.manga div.item-summary div.post-title h3 a');
        return data.map(element => {
            return {
                id: this.getRootRelativeOrAbsoluteLink(element, request.url),
                title: element.text.trim()
            };
        });
    }
}