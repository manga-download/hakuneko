import WordPressMadara from './templates/WordPressMadara.mjs';

export default class ManhuaUs extends WordPressMadara {

    constructor() {
        super();
        super.id = 'manhuaus';
        super.label = 'Manhua Us';
        this.tags = [ 'webtoon', 'english' ];
        this.url = 'https://manhuaus.com';

        this.queryPages = 'ul.blocks-gallery-grid li.blocks-gallery-item source';
    }

    async _handleConnectorURI(payload) {
        let request = new Request(payload.url, {
            "headers": {
                "x-referer": "https://manhuaus.com/"
            },
        });
        let response = await fetch(request);
        let data = await response.blob();
        data = await this._blobToBuffer(data);
        this._applyRealMime(data);
        return data;
    }
}