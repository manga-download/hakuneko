import Connector from '../engine/Connector.mjs';
import Manga from '../engine/Manga.mjs';

export default class ComicBoost extends Connector {

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
        const chapterList = [];
        const request = new Request(new URL(manga.id, this.url), this.requestOptions);
        const [ data ] = await this.fetchDOM(request, 'ul.pagination-list.right li.to-last a');
        const pageCount = data ?parseInt(new URL(data.href).searchParams.get('p')) : 1;
        for(let page = 1; page <= pageCount; page++) {
            const chapters = await this._getChaptersFromPage(manga, page);
            chapterList.push(...chapters);
        }
        return chapterList.filter(el => !el.id.includes('?coin=')); //exclude not accessible chapters
    }

    async _getChaptersFromPage(manga, page) {
        const url = new URL(manga.id, this.url);
        url.searchParams.set('p', page.toString());
        const request = new Request(url, this.requestOptions );
        const data = await this.fetchDOM(request, 'a.book-product-list-item');
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
            new Promise((resolve, reject) => {

                try {
                
                    setTimeout(async () => {
                   
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
                        'viewerb5c': null,
                        'viewerSpread': {},
                        'queryParamForContentUrl' : parameters.contentAppendParam,
                    });
                    //Create the bookloader
                    const bl = new NFBR.a5n();
                    bl.B0a = "normal_default";
                   
                    //Create a "Content" that will be filled using the bookloader as5 async function
                    let data = new NFBR.a6i.Content(parameters.url);
                    let v_a6L = new NFBR.a6G.a6L(model); //a6G.a6L seems to be named identical between publus versions
                    await bl.a5s(data, "configuration", v_a6L);
                   
                    //data is now our JSON with all the infos
                    const pages = data.configuration.contents.map((page, index) => {
                   
                        let mode = 'raw';
                        let extension = '.jpeg';
                   
                        //*****************/
                        //GETTING PAGE URL
                        //*****************/
                        //Create a Page
                        const fPage = new NFBR.a6i.Page(index, page.file, "0", extension, "");
                        const realURL = v_a6L.a6T(data, fPage); //get real URL, may change depending on publus version
                   
                        //*****************************/
                        //GETTING IMAGE SCRAMBLE DATA
                        //*****************************/
                   
                        //Fill infos in the page for a7b to work
                        const fileinfos = data.files[index].FileLinkInfo.PageLinkInfoList[0].Page;
                        fPage.width = fileinfos.Size.Width;
                        fPage.height = fileinfos.Size.Height;
                        fPage.info = fileinfos;
                        //Fill more infos needed for  unscrambling
                        fPage.a7b(data); // function names depends on publus version
                        
                        let blocks  = [];
                        if (fileinfos.BlockHeight) //if we have a block size for the page, its a puzzle !
                        {
                            mode = 'puzzle';
                            blocks = window.NFBR.a6G.a5x.prototype.g8w(fPage, fPage.width, fPage.height)
                        }
                   
                        return {
                            mode: mode,
                            imageUrl: realURL,
                            encryption: {
                                blocks: JSON.stringify(blocks),//stringify the array greatly speed up createConnectorURI :)
                            }
                        };
                    });
                    resolve(pages);
                    }, 1000);
                } catch (error) {
                    reject(error)
                }
            });
        `;

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
            case 'puzzle': {
                let data = await response.blob();
                data = await this._descrambleImage(data, payload.encryption.blocks);
                return this._blobToBuffer(data);
            }
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
            const blockz = JSON.parse(blocks);

            for (let q of blockz) {
                ctx.drawImage(bitmap, q.destX, q.destY, q.width, q.height, q.srcX, q.srcY, q.width, q.height);
            }
            canvas.toBlob(data => {
                resolve(data);
            }, Engine.Settings.recompressionFormat.value, parseFloat(Engine.Settings.recompressionQuality.value)/100);
        } );
    }
}
