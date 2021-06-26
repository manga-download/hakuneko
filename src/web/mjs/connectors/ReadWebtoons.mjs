import WordPressMadara from './templates/WordPressMadara.mjs';

export default class ReadWebtoons extends WordPressMadara {

    constructor() {
        super();
        super.id = 'readwebtoons';
        super.label = 'WebtoonUpdates';
        this.tags = [ 'webtoon', 'hentai', 'english' ];
        this.url = 'https://webtoonupdates.com';

        this.queryPages = 'div.reading-content p source, div.reading-content div.page-break source';
    }

    async _getProtectionLink(chapter) {
        const uri = new URL(chapter.id, this.url);
        const request = new Request(uri, this.requestOptions);
        const data = await this.fetchDOM(request, 'div.read-container a#autoclick');
        return data[0].href;
    }

    async _getImagePageLink(link) {
        const request = new Request(link, this.requestOptions);
        const data = await this.fetchDOM(request, 'div.process_load_imgs a.go-view-loaded_images');
        return data[0].href;
    }

    async _getImageLinks(chapterID, chapterNonce, session) {
        const images = [];
        for(let next = 1; next > 0; ) {
            const request = new Request('https://us.icdm.info/wp-admin/admin-ajax.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
                    'x-cookie': `PHPSESSID=${session}; allow_read_ddata=1`
                },
                body: new URLSearchParams({
                    action: 'z_do_ajax',
                    _action: 'decode_images',
                    nonce: chapterNonce,
                    p: chapterID
                }).toString()
            });
            const data = await this.fetchJSON(request);
            images.push(data.mes.match(/src='([^']+)'/)[1]);
            next = data.going;
        }
        return images;
    }

    async _getPages(chapter) {
        const session = new Array(4).fill().map(() => Math.random().toString(36)).join('').replace(/0\./g, '');
        const protectionLink = await this._getProtectionLink(chapter);
        const imageLink = await this._getImagePageLink(protectionLink);
        const request = new Request(imageLink, this.requestOptions);
        request.headers.set('x-cookie', 'PHPSESSID=' + session);
        const data = await this.fetchDOM(request, 'link[rel="shortlink"], script[id*="js-extra"]');
        const chapterID = data[0].href.match(/\d+$/)[0];
        const chapterNonce = data[1].text.match(/"nonce":"([^"]+)"/)[1];
        return this._getImageLinks(chapterID, chapterNonce, session);
    }
}