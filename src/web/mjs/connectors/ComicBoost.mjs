import Publus from './templates/Publus.mjs';
import Manga from '../engine/Manga.mjs';

export default class ComicBoost extends Publus {

    constructor() {
        super();
        super.id = 'comicboost';
        super.label = 'comicブースト (Comic Boost)';
        this.tags = [ 'manga', 'japanese' ];
        this.url = 'https://comic-boost.com';
    }

    async _getMangaFromURI(uri) {
        let request = new Request(uri, this.requestOptions);
        let data = await this.fetchDOM(request, 'h1.comic-title');
        let id = uri.pathname + uri.search;
        let title = data[0].textContent.trim();
        return new Manga(this, id, title);
    }

    async _getMangas() {
        let mangaList = [];
        const uri = new URL('/genre/', this.url);
        const request = new Request(uri, this.requestOptions);
        const data = await this.fetchDOM(request, 'ul.pagination-list.right li.to-last a');
        const pageCount = parseInt(data[0].href.match(/(\d+)$/)[1]);
        for(let page = 1; page <= pageCount; page++) {
            const mangas = await this._getMangasFromPage(page);
            mangaList.push(...mangas);
        }
        return mangaList;
    }

    async _getMangasFromPage(page) {
        const uri = new URL('/genre/?p=' + page, this.url);
        const request = new Request(uri, this.requestOptions);
        const data = await this.fetchDOM(request, 'div.book-list-item-inner');
        return data.map(element => {
            return {
                id: this.getRootRelativeOrAbsoluteLink(element.querySelector('a.book-list-item-thum-wrapper'), this.url),
                title: element.querySelector('source.thum').getAttribute('title').trim()
            };
        });
    }

    async _getChapters(manga) {
        let request = new Request(new URL(manga.id, this.url), this.requestOptions );
        let data = await this.fetchDOM(request, 'a.book-product-list-item');
        return data.map(element => {
            return {
                id: this.getRootRelativeOrAbsoluteLink(element, this.url),
                title: element.dataset.title.trim(),
                language: ''
            };
        });
    }

    async _getPages(chapter) {

        const script = `
        new Promise((resolve) => {
            const starttime = Date.now();
            setTimeout(async () => {
           
                //Get Meta Parameters
                const a2f = NFBR.a2F ? new NFBR.a2F() : new NFBR.a2f();
                const params = new URL(window.location).searchParams;
                const parameters = await a2f.a5W({
                    contentId: params.get(NFBR.a5q.Key.CONTENT_ID), // Content ID => 'cid'
                    a6m: params.get(NFBR.a5q.Key.LICENSE_TOKEN), // License Token => 'lit'
                    preview: params.get(NFBR.a5q.Key.LOOK_INSIDE) === '1', // Look Inside => 'lin'
                    contentType: params.get(NFBR.a5q.Key.CONTENT_TYPE) || 1, // Content Type => 'cty'
                    title: params.get(NFBR.a5q.Key.CONTENT_TITLE), // Content Title => 'cti'
                    winWidth: 3840,
                    winHeight: 2160
                });
           
                //Create a model
                const model = new NFBR.a6G.Model({
                    'settings': new self.NFBR.Settings('NFBR.SettingData'),
                    'viewerFontSize': self.NFBR.a0X.a3k,
                    'viewerFontFace': self.NFBR.a0X.a3k,
                    'viewerSpreadDouble': true,
                    'viewerAnimationPattern': self.NFBR.a5p.B1P() ? self.NFBR.a0X.a3m : self.NFBR.a0X.a3L,
                    'viewerAnimationPatternForFixed': self.NFBR.a5p.B1P() ? self.NFBR.a0X.a9j : self.NFBR.a0X.ANIMATION_PATTERN_FOR_FIXED_DEFAULT,
                    'viewerAnimationSpeed': self.NFBR.a0X.a3M,
                    'viewerPageTransitionAxis': self.NFBR.a0X.A1P,
                    'viewerTapRange': self.NFBR.a0X.a4D,
                    'A8r': new self.NFBR.a6iMark.b0g('NFBR.ResumeData'),
                    'A6M': new self.NFBR.a6iMark.A7m('NFBR.a6imarkData'),
                    'viewerb5c': null,
                    'viewerSpread': {},
                });
           
                //Create the bookloader
                const bl = new NFBR.a5n();
                bl.B0a = "normal_default";
           
                //Create a "Content" that will be filled using the bookloader as5 async function
                let data = new NFBR.a6i.Content(parameters.url);
                await bl.a5s(data, "configuration", new NFBR.a6G.a6L(model));
           
                //data is now our JSON with all the infos
                const pages = data.configuration.contents.map((page, index) => {
           
                    let mode = 'puzzle';
                    let extension = '.jpeg';
                    if (data.ct && data.et && data.st) {
                        mode = 'RC4+puzzle';
                        extension += '.dat';
                    }
           
                    //let file = page.file + '/0';
                    //for (let d = v = 0; d < file.length; d++) {
                    //    v += file.charCodeAt(d);
                    //}
           
                    //*****************/
                    //GETTING PAGE URL
                    //*****************/
                    //Create a Page
                    const fPage = new NFBR.a6i.Page(index, page.file, "0", extension, "");
                    //Calculate Page URL using data from JSON
                    const realURL = data.url + fPage.a7B(data);
           
                    //*****************************/
                    //GETTING IMAGE SCRAMBLE DATA
                    //*****************************/
           
                    //Fill infos in the page for a7b to work
                    const fileinfos = data.files[index].FileLinkInfo.PageLinkInfoList[0].Page;
                    fPage.width = fileinfos.Size.Width;
                    fPage.height = fileinfos.Size.Height;
                    fPage.info = fileinfos;
                    //Fill more infos needed for b0Q unscrambling
                    fPage.a7b(data);
           
                    //console.log(fPage);
           
                    //test : get blocks
                    const blocks = window.NFBR.a6G.a5x.prototype.b0Q(fPage, fPage.width, fPage.height);
                    //console.log(blocks);
           
                    return {
                        mode: mode,
                        imageUrl: realURL,
                        encryption: {
                            //pattern: v % NFBR.a0X.a3h + 1,
                            blocks: blocks,
                            key: {
                                ct: data.ct,
                                et: data.et,
                                st: data.st,
                                bs: data.bs || 128,
                                hs: data.hs || 1024,
                                useRawContent: undefined
                            }
                        }
                    };
                });
           
                console.log(Date.now() - starttime / 1000)
           
                resolve(pages);
           
            }, 1000);
        `;

        //FIRST : get real viewer location
        const uri = new URL( chapter.id, this.url );
        const request = new Request( uri, this.requestOptions );
        const data = await Engine.Request.fetchUI(request, script, 60000, true);
        return data.map(page => page.mode === 'raw' ? page.imageUrl : this.createConnectorURI(page));
    }

    async _handleConnectorURI(payload) {
        const uri = new URL(payload.imageUrl, this.url);
        const request = new Request(uri, this.requestOptions);
        const response = await fetch(request);
        switch (payload.mode) {
            /*
            case 'RC4+puzzle': {
                let data = await response.text();
                data = this._decryptRC4(data, uri.pathname.split('/').pop(), payload.encryption.key);
                data = await this._descrambleImage(data, payload.encryption.pattern);
                return this._blobToBuffer(data);
            }*/
            case 'puzzle': {
                let data = await response.blob();
                data = await this._descrambleImage(data, payload.encryption.blocks);
                return this._blobToBuffer(data);
            }
            /*
            case 'xor': {
                let data = await response.arrayBuffer();
                data = {
                    mimeType: response.headers.get('content-type'),
                    data: await this._decryptXOR(data, payload.encryption.key)
                };
                this._applyRealMime(data);
                return data;
            }*/
            default: {
                let data = await response.blob();
                return this._blobToBuffer(data);
            }
        }
    }

    async _descrambleImage(scrambled, blocks) {
        let bitmap = await createImageBitmap(scrambled);
        return new Promise(resolve => {
            let canvas = document.createElement('canvas');
            canvas.width = bitmap.width;
            canvas.height = bitmap.height;
            var ctx = canvas.getContext('2d');
            for (let q of blocks) {
                ctx.drawImage(bitmap, q.destX, q.destY, q.width, q.height, q.srcX, q.srcY, q.width, q.height);
            }
            canvas.toBlob(data => {
                resolve(data);
            }, Engine.Settings.recompressionFormat.value, parseFloat(Engine.Settings.recompressionQuality.value)/100);
        } );
    }

}
