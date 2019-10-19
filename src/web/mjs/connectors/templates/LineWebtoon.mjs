import Connector from '../../engine/Connector.mjs';
import Manga from '../../engine/Manga.mjs';

export default class LineWebtoon extends Connector {

    constructor() {
        super();
        super.id = undefined;
        super.label = undefined;
        this.tags = [];
        this.url = undefined;
        this.baseURL = 'https://www.webtoons.com';
        this.requestOptions.headers.set( 'x-referer', this.baseURL );
    }

    get icon() {
        return '/img/connectors/linewebtoon';
    }

    async _getMangaFromURI( uri ) {
        try {
            let request = new Request(uri, this.requestOptions);
            let data = await this.fetchDOM(request, 'head meta[property="og:title"]');
            let id = uri.pathname + uri.search;
            let title = data[0].content.trim();
            return new Manga(this, id, title);
        } catch(error) {
            return null;
        }
    }

    async _getMangaList( callback ) {
        try {
            let request = new Request(`http://cdn.hakuneko.download/${this.id}/mangas.json`, this.requestOptions);
            let data = await this.fetchJSON(request);
            callback(null, data);
        } catch(error) {
            console.error(error, this);
            callback(error, undefined);
        }
    }

    async _getChapterListPage(uri) {
        let request = new Request(uri, this.requestOptions);
        let data = await this.fetchDOM(request, 'div.detail_body div.detail_lst ul li > a');
        return data.map(element => {
            let chapter = element.querySelector('span.tx');
            let title = chapter ? chapter.textContent.trim() + ' - ' : '';
            title += element.querySelector('span.subj span').textContent.trim();
            return {
                id: this.getRootRelativeOrAbsoluteLink(element, this.baseURL),
                title: title,
                language: ''
            };
        });
    }

    async _getChapterList(manga, callback) {
        try {
            let chapterList = [];
            let uri = new URL(manga.id, this.baseURL);
            for(let page = 1; page < 999; page++) {
                uri.searchParams.set('page', page);
                let chapters = await this._getChapterListPage(uri);
                if(chapters.length > 0 && (chapterList.length === 0 || chapters[chapters.length - 1].id !== chapterList[chapterList.length - 1].id)) {
                    chapterList.push(...chapters);
                } else {
                    break;
                }
            }
            callback(null, chapterList);
        } catch(error) {
            console.error(error, manga);
            callback(error, undefined);
        }
    }

    async _getPageList(manga, chapter, callback) {
        try {
            // https://www.webtoons.com/id/horror/guidao/prolog/viewer?title_no=874&episode_no=1
            let script = `
                new Promise(async resolve => {
                    if(document.querySelector('div#ozViewer div.oz-pages')) {
                        let templateURLs = window.__motiontoonViewerState__.motiontoonParam.pathRuleParam;
                        let uri = window.__motiontoonViewerState__.motiontoonParam.viewerOptions.documentURL;
                        let response = await fetch(uri);
                        let data = await response.json();
                        for(let page of data.pages) {
                            console.log('PAGE:', page.id);
                            for(let layer of page.layers) {
                                let layerAsset = layer.asset.split('/');
                                let layerAssetFile = data.assets[layerAsset[0]][layerAsset[1]];
                                let layerAssetExtension = layerAssetFile.split('.').pop();
                                if(layer.type === 'image') {
                                    layer.asset = templateURLs['image'][layerAssetExtension].replace('{=filename}', layerAssetFile);
                                }
                                console.log('  LAYER:', layer.type, '=>', layer.asset);
                                for(let keyframe in layer.effects) {
                                    let effect = layer.effects[keyframe]['sprite'];
                                    if(effect && effect.type === 'sprite') {
                                        let effectAsset = effect.asset.split('/');
                                        let effectAssetFile = data.assets[effectAsset[0]][effectAsset[1]];
                                        let effectAssetExtension = effectAssetFile.split('.').pop();
                                        effect.asset = templateURLs['image'][effectAssetExtension].replace('{=filename}', effectAssetFile);
                                        console.log('    EFFECT:', effect.type, '=>', effect.asset);
                                        for(let index in effect.collection) {
                                            let collectionAsset = effect.collection[index].split('/');
                                            let collectionAssetFile = data.assets[collectionAsset[0]][collectionAsset[1]];
                                            let collectionAssetExtension = collectionAssetFile.split('.').pop();
                                            effect.collection[index] = templateURLs['image'][collectionAssetExtension].replace('{=filename}', collectionAssetFile);
                                            console.log('      COLLECTION:', index, '=>', effect.collection[index]);
                                        }
                                    }
                                }
                            }
                        }
                        resolve(data.pages);
                    } else {
                        let images = [...document.querySelectorAll('div.viewer div.viewer_lst div.viewer_img img[data-url]')];
                        let links = images.map(element => new URL(element.dataset.url, window.location).href);
                        resolve(links);
                    }
                });
            `;
            let request = new Request(this.baseURL + chapter.id, this.requestOptions);
            let data = await Engine.Request.fetchUI(request, script);
            let pageList = data.map(payload => this.createConnectorURI(payload));
            callback(null, pageList);
        } catch(error) {
            console.error(error, chapter);
            callback(error, undefined);
        }
    }

    async _handleConnectorURI(payload) {
        /*
         * TODO: only perform requests when from download manager
         * or when from browser for preview and selected chapter matches
         */
        if(typeof payload === 'string') {
            let uri = new URL(payload);
            uri.searchParams.delete('type');
            let request = new Request(uri, this.requestOptions);
            let response = await fetch(request);
            let data = await response.blob();
            return this._blobToBuffer(data);
        } else {
            //console.log(payload);
            let canvas = document.createElement('canvas');
            canvas.width = payload.width;
            canvas.height = payload.height;
            let ctx = canvas.getContext("2d");
            if(payload.background.color) {
                ctx.fillStyle = payload.background.color;
                ctx.fillRect(0, 0, canvas.width, canvas.height);
            }
            for(let layer of payload.layers) {
                if(layer.type === 'image') {
                    // TODO: process layer.keyframes in case top/left/width/height is animated?
                    let image = await this._loadImage(layer.asset);
                    ctx.drawImage(image, layer.left, layer.top, layer.width, layer.height);
                }
                // TODO: process layer.effects?
            }
            let data = await this._canvasToBlob(canvas);
            return this._blobToBuffer(data);
        }
    }

    async _loadImage(url) {
        return new Promise(resolve => {
            let uri = new URL(url);
            uri.searchParams.delete('type');
            let image = new Image();
            image.onload = () => resolve(image);
            image.src = uri.href;
        });
    }

    async _canvasToBlob(canvas) {
        return new Promise(resolve => {
            canvas.toBlob(data => {
                resolve(data);
            }, Engine.Settings.recompressionFormat.value, parseFloat(Engine.Settings.recompressionQuality.value)/100);
        });
    }
}