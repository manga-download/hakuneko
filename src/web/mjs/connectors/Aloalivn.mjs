import WordPressMadara from './templates/WordPressMadara.mjs';

export default class Aloalivn extends WordPressMadara {

    constructor() {
        super();
        super.id = 'aloalivn';
        super.label = 'Aloalivn';
        this.tags = [ 'manga', 'webtoon', 'english' ];
        this.url = 'https://aloalivn.com';
        this.queryPages = 'li.blocks-gallery-item source';
    }

    async _handleConnectorURI(payload) {
        let request = new Request(payload.url, {
            "headers": {
                "x-referer": "https://aloalivn.com/"
            },
        });
        let response = await fetch(request);
        let data = await response.blob();
        data = await this._blobToBuffer(data);
        this._applyRealMime(data);
        return data;
    }
}