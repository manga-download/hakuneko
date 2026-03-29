import WordPressMadara from './templates/WordPressMadara.mjs';

export default class KumoTran extends WordPressMadara {

    constructor() {
        super();
        super.id = 'kumotran';
        super.label = 'KumoTran';
        this.tags = [ 'manga', 'webtoon', 'thai' ];
        this.url = 'https://www.kumotran.com';

        this.queryPages = 'div.reading-content source, div.reading-content canvas';
    }

    async _getPages(chapter) {
        let uri = new URL(chapter.id, this.url);
        let request = new Request(uri, this.requestOptions);
        let data = await this.fetchDOM(request, this.queryPages);
        return data.map(element => {
            if(element instanceof HTMLCanvasElement) {
                return this.createConnectorURI({
                    url: this.getAbsolutePath(element.dataset['url'], request.url),
                    pattern: this._extractDescramblePattern(element)
                });
            } else {
                return this.getAbsolutePath(element, request.url);
            }
        });
    }

    async _handleConnectorURI(payload) {
        const request = new Request(payload.url, this.requestOptions);
        const response = await fetch(request);
        let data = await response.blob();
        data = await this._descrambleImage(data, payload.pattern);
        return this._blobToBuffer(data);
    }

    _extractDescramblePattern(canvas) {
        //const id = canvas.id.replace('image', '');
        const script = eval(canvas.nextElementSibling.text.replace('eval(', '('));
        const start = script.indexOf('sovleImage=[[') + 11;
        const end = script.indexOf(']];', start) + 2;
        const pattern = script.slice(start, end);
        return JSON.parse(pattern);
    }

    async _descrambleImage(scrambled, key) {
        const bitmap = await createImageBitmap(scrambled);
        return new Promise(resolve => {
            const canvas = document.createElement('canvas');
            canvas.width = bitmap.width;
            canvas.height = bitmap.height;
            const ctx = canvas.getContext('2d');
            for (let i = 0; i < key.length; i++) {
                ctx.drawImage(bitmap, key[i][2], key[i][3], 500, 292, key[i][0], key[i][1], 500, 292);
            }
            canvas.toBlob(data => {
                resolve(data);
            }, Engine.Settings.recompressionFormat.value, parseFloat(Engine.Settings.recompressionQuality.value)/100);
        } );
    }
}