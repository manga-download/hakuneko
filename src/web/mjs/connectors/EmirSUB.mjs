import WordPressMadara from './templates/WordPressMadara.mjs';

export default class EmirSUB extends WordPressMadara {

    constructor() {
        super();
        super.id = 'emirsub';
        super.label = 'EmirSUB';
        this.tags = [ 'webtoon', 'turkish' ];
        this.url = 'http://emirsub.com';
    }

    async _getMangas() {
        let request = new Request(this.url, this.requestOptions);
        let data = await this.fetchDOM(request, this.queryMangas);
        return data.map(element => {
            return {
                id: this.getRootRelativeOrAbsoluteLink(element, request.url),
                title: element.text.trim()
            };
        });
    }
}