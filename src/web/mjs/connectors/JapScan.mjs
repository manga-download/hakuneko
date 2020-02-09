import Connector from '../engine/Connector.mjs';
import Manga from '../engine/Manga.mjs';

export default class JapScan extends Connector {

    constructor() {
        super();
        super.id = 'japscan';
        super.label = 'JapScan';
        this.tags = [ 'manga', 'french' ];
        this.url = 'https://www.japscan.co';
        this.urlCDN = 'https://c.japscan.co/';

        // Private members for internal use that can be configured by the user through settings menu (set to undefined or false to hide from settings menu!)
        this.config = {
            throttle: {
                label: 'Throttle Requests [ms]',
                description: 'Enter the timespan in [ms] to delay consecuitive HTTP requests.\nThe image download may fail for to many consecuitive requests.',
                input: 'numeric',
                min: 1000,
                max: 7500,
                value: 1000
            }
        };
    }

    async _getMangaFromURI(uri) {
        let request = new Request(uri, this.requestOptions);
        let data = await this.fetchDOM(request, 'div#main div.card h1');
        let id = uri.pathname + uri.search;
        let title = data[0].textContent.trim();
        return new Manga(this, id, title);
    }

    async _getMangas() {
        let mangaList = [];
        let request = new Request(new URL('/mangas/1', this.url), this.requestOptions);
        let data = await this.fetchDOM(request, 'div.card ul.pagination li:last-of-type a');
        let pageCount = parseInt(data[0].text.trim());
        for(let page = 1; page <= pageCount; page++) {
            let mangas = await this._getMangasFromPage(page);
            mangaList.push(...mangas);
        }
        return mangaList;
    }

    async _getMangasFromPage(page) {
        let request = new Request(new URL('/mangas/' + page, this.url), this.requestOptions);
        let data = await this.fetchDOM(request, 'div.card div p.p-1 a', 5);
        return data.map(element => {
            return {
                id: this.getRootRelativeOrAbsoluteLink(element, request.url),
                title: element.text.trim()
            };
        });
    }

    async _getChapters(manga) {
        let request = new Request(new URL(manga.id, this.url), this.requestOptions);
        let data = await this.fetchDOM(request, 'div.card div#chapters_list div.chapters_list a');
        return data.map(element => {
            this.cfMailDecrypt(element);
            return {
                id: this.getRootRelativeOrAbsoluteLink(element, request.url),
                title: element.text.replace(manga.title, '').replace('Scan', '').replace('VF', '').trim(),
                language: ''
            };
        });
    }

    async _getPages(chapter) {
        let request = new Request(new URL(chapter.id, this.url), this.requestOptions);
        let data = await this.fetchDOM(request, 'div.container select#pages option');
        return data.map(element => this.createConnectorURI({
            imageURL: this.getAbsolutePath(element.value, request.url),
            imageFile: element.dataset['img'] ? element.dataset.img : null
        }));
    }

    async _handleConnectorURI(payload) {
        /*
         * TODO: only perform requests when from download manager
         * or when from browser for preview and selected chapter matches
         */
        let imageLink = payload.imageFile;
        let uri = new URL(payload.imageURL);
        let request = new Request(uri, this.requestOptions);
        let dom = await this.fetchDOM(request, '', 3);

        if(!imageLink) {
            let img = dom.querySelector('div#image');
            if(!img || !img.dataset['src']) {
                throw new Error( 'No element with id #image found in page, or dataset.src is missing!' );
            }
            imageLink = new URL(img.dataset.src, uri.origin).href;
        }

        if(dom.querySelector('script[src*="nawzan_ajynulpaz"]')) {
            return this._getImageDescrambled(imageLink, this._descrambleDynamic, this._extractDescramblePattern(dom, imageLink));
        }

        // TODO: this descrambling is old and probably no longer used ...
        if(dom.querySelector('script[src*="_UibMqYb"]')) {
            if(imageLink.startsWith(this.urlCDN + 'cr_images')) {
                return this._getImageDescrambled(imageLink, this._descrambleCR, null);
            } else if(imageLink.startsWith(this.urlCDN + 'clel')) {
                return this._getImageDescrambled(imageLink, this._descrambleCLEL, null);
            } else if(imageLink.startsWith(this.urlCDN + 'lel')) {
                return this._getImageDescrambled(imageLink, this._descrambleCLEL, null);
            } else {
                throw new Error(`The image descrambling for '${imageLink}' is not yet supported!`);
            }
        }

        return super._handleConnectorURI(imageLink);
    }

    _extractDescramblePattern(dom, imageLink) {
        let rot13 = function (char) {
            return String.fromCharCode(('Z' >= char ? 90 : 122) >= (char = char.charCodeAt(0) + 13) ? char : char - 26);
        };

        let comments = [];
        (function getDescrambleComments(element, comments) {
            if(element.nodeType === window.Node.COMMENT_NODE) {
                let match = element.nodeValue.match(/^\s*\((.+)\)\s*$/);
                if(match && match[1]) {
                    comments.push(match[1]);
                }
            }
            if(element.childNodes) {
                element.childNodes.forEach(node => getDescrambleComments(node, comments));
            }
        })(dom, comments);

        let descrambleComment = comments.pop()
            .replace(/[a-zA-Z]/g, rot13)
            .replace(/@/g, '+')
            .replace(/\$/g, '/')
            .replace(/\u00a7/g, '=');

        let encrypted = CryptoJS.enc.Base64.parse(descrambleComment.substring(45).substring(0, descrambleComment.length - 128 - 32 - 13)).toString(CryptoJS.enc.Utf8);

        let key = CryptoJS.MD5(imageLink).toString().split('').reverse().join('')
            .replace(/[a-zA-Z]/g, rot13);
        key = CryptoJS.MD5(key).toString();
        key = CryptoJS.SHA1(key).toString();
        key = CryptoJS.PBKDF2(key, CryptoJS.enc.Hex.parse(descrambleComment.substring(descrambleComment.length - 128, descrambleComment.length)), {
            'hasher': CryptoJS.algo.SHA512,
            'keySize': 8,
            'iterations': 999
        });

        let decrypted = CryptoJS.AES.decrypt(encrypted, key, { iv: CryptoJS.enc.Hex.parse(descrambleComment.substring(0, 32)) })
            .toString(CryptoJS.enc.Utf8)
            .replace(/[a-z]/g, char => 'abcdefghijklmnopqrstuvwxyz'['zyxwvutsrqponmlkjihgfedcba'.indexOf(char)])
            .replace(/[A-Z]/g, char => 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'['ZYXWVUTSRQPONMLKJIHGFEDCBA'.indexOf(char)])
            .replace(/~/g, '{')
            .replace(/\^/g, '}')
            .replace(/m/g, '"')
            .replace(/k/g, ':')
            .replace(/l/g, ',')
            .replace(/[a-z]/g, char => '0123456789'['jdegcifbah'.indexOf(char)] || char)
            .replace(/[0-9]/g, char => '0123456789'['7938205146'.indexOf(char)] || char);

        return JSON.parse(decrypted);
    }

    async _getImageDescrambled(url, descrambler, context) {
        let request = new Request(url, this.requestOptions);
        let response = await fetch(request);
        let data = await response.blob();
        let bitmap = await createImageBitmap(data);
        data = await descrambler.call(this, bitmap, context);
        data = await this._blobToBuffer(data);
        this._applyRealMime(data);
        return data;
    }

    async _descrambleDynamic(bitmap, pattern) {
        return new Promise(resolve => {
            let canvas = document.createElement('canvas');
            canvas.width = bitmap.width;
            canvas.height = bitmap.height;
            var ctx = canvas.getContext('2d');

            for(let key in pattern) {
                let blockWidth = 100;
                let blockHeight = blockWidth;
                let modX = Math.ceil(bitmap.width / blockWidth);
                let modY = modX;

                let source = parseInt(pattern[key]);
                source = (source - 843) / 7;
                let sourceX = source % modX * blockWidth;
                let sourceY = Math.floor(source / modY) * blockHeight;

                let target = parseInt(key);
                target = (target - 462) / 5;
                let targetX = target % modX * blockWidth;
                let targetY = Math.floor(target / modY) * blockHeight;

                ctx.drawImage(bitmap, sourceX, sourceY, blockWidth, blockHeight, targetX, targetY, blockWidth, blockHeight);
            }

            canvas.toBlob(data => {
                resolve(data);
            }, Engine.Settings.recompressionFormat.value, parseFloat(Engine.Settings.recompressionQuality.value )/100);
        });
    }

    // [OBSOLETE] This descrambling pattern is probably no longer used
    _descrambleCR( bitmap ) {
        return new Promise( resolve => {
            let width = bitmap.width;
            let height = bitmap.height;

            // stuff from japscan script
            let w_p = Math.floor( width / 5 );
            let h_p = Math.floor( height / 5 );
            let r_w = width - w_p * 5 ;
            //let r_h = height - ( h_p * 5 );
            let offsetsX = [w_p*2, w_p*4, width, w_p*8 + r_w, w_p*6 + r_w];
            let offsetsY = [h_p*4, h_p*3, h_p*2, h_p, 0];

            let clipWidth = w_p;
            let clipHeight = h_p;
            // normalize background repeats
            offsetsX = offsetsX.map( offset => offset % width );
            offsetsY = offsetsY.map( offset => offset % height );

            let canvas = document.createElement( 'canvas' );
            canvas.width = bitmap.width;
            canvas.height = bitmap.height;
            var ctx = canvas.getContext( '2d' );
            for (let y = 0; y < offsetsY.length; y++) {
                for (let x = 0; x < offsetsX.length; x++) {
                    ctx.drawImage( bitmap, offsetsX[x], offsetsY[y], clipWidth, clipHeight, x * clipWidth, y * clipHeight, clipWidth, clipHeight );
                }
            }
            canvas.toBlob( data => {
                resolve( data );
            }, Engine.Settings.recompressionFormat.value, parseFloat( Engine.Settings.recompressionQuality.value )/100 );
        } );
    }

    // [OBSOLETE] This descrambling pattern is probably no longer used
    _descrambleCLEL( bitmap ) {
        return new Promise( resolve => {
            let tileWidth = 100;
            let tileHeight = 100;
            let tileColumnCount = Math.ceil(bitmap.width / tileWidth);
            let tileRowCount = Math.ceil(bitmap.height / tileHeight);
            let tileResidualWidth = bitmap.width % tileWidth;
            let tileResidualHeight = bitmap.height % tileHeight;

            let canvas = document.createElement( 'canvas' );
            canvas.width = bitmap.width;
            canvas.height = bitmap.height;
            let ctx = canvas.getContext( '2d' );

            for(let row = 0; row < tileRowCount; row++) {
                let imageY = this._getTilePosition(row, tileRowCount, tileHeight);
                for (let column = 0; column < tileColumnCount; column++) {
                    let imageX = this._getTilePosition(column, tileColumnCount, tileWidth);
                    let clipWidth = column == tileColumnCount - 1 && tileResidualWidth > 0 ? tileResidualWidth : tileWidth ;
                    let clipHeight = row == tileRowCount - 1 && tileResidualHeight > 0 ? tileResidualHeight : tileHeight ;
                    ctx.drawImage( bitmap, imageX, imageY, clipWidth, clipHeight, column * tileWidth/*canvasX*/, row * tileHeight/*canvasY*/, clipWidth, clipHeight );
                }
            }
            canvas.toBlob( data => {
                resolve( data );
            }, Engine.Settings.recompressionFormat.value, parseFloat( Engine.Settings.recompressionQuality.value )/100 );
        } );
    }

    _getTilePosition( tile, tileCount, tileSize ) {
        return tile % 2 == 0 && tileCount - 2 == tile ? (tile - 1) * tileSize + tileSize : tileCount - 1 == tile ? (tile - 1) * tileSize + tileSize : tile % 2 != 0 ? (tile - 1) * tileSize : (tile + 1) * tileSize;
    }
}