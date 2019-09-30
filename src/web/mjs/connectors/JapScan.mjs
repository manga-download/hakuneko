import Connector from '../engine/Connector.mjs';

export default class JapScan extends Connector {

    constructor() {
        super();
        super.id = 'japscan';
        super.label = 'JapScan';
        this.tags = [ 'manga', 'french' ];
        this.url = 'https://www.japscan.co';
        this.urlCDN = 'https://c.japscan.co/';
    }

    /**
     *
     */
    _getMangaListFromPages( mangaPageLinks, index ) {
        if( index === undefined ) {
            index = 0;
        }
        return this.wait( 0 )
            .then ( () => this.fetchDOM( mangaPageLinks[ index ], 'div.card div p.p-1 a', 5 ) )
            .then( data => {
                let mangaList = data.map( element => {
                    return {
                        id: this.getRelativeLink( element ),
                        title: element.text.trim()
                    };
                } );
                if( index < mangaPageLinks.length - 1 ) {
                    return this._getMangaListFromPages( mangaPageLinks, index + 1 )
                        .then( mangas => mangas.concat( mangaList ) );
                } else {
                    return Promise.resolve( mangaList );
                }
            } );
    }

    /**
     *
     */
    _getMangaList( callback ) {

        this.fetchDOM( this.url + '/mangas/1', 'div.card ul.pagination li:last-of-type a' )
            .then( data => {
                let pageCount = parseInt( data[0].text.trim() );
                let pageLinks = [... new Array( pageCount ).keys()].map( page => this.url + '/mangas/' + ( page + 1 ) );
                return this._getMangaListFromPages( pageLinks );
            } )
            .then( data => {
                callback( null, data );
            } )
            .catch( error => {
                console.error( error, this );
                callback( error, undefined );
            } );
    }

    /**
     *
     */
    _getChapterList( manga, callback ) {
        this.fetchDOM( this.url + manga.id, 'div.card div#chapters_list div.chapters_list a' )
            .then( data => {
                let chapterList = data.map( element => {
                    this.cfMailDecrypt( element );
                    return {
                        id: this.getRelativeLink( element ),
                        title: element.text.replace( manga.title, '' ).replace( 'Scan', '' ).replace( 'VF', '' ).trim(),
                        language: 'french'
                    };
                } );
                callback( null, chapterList );
            } )
            .catch( error => {
                console.error( error, manga );
                callback( error, undefined );
            } );
    }

    /**
     *
     */
    _getPageList( manga, chapter, callback ) {
        let request = new Request( this.url + chapter.id, this.requestOptions );
        this.fetchDOM( request, 'div.container select#pages option' )
            .then( data => {
                let pageLinks = data.map( element => this.createConnectorURI( {
                    imageURL: this.getAbsolutePath( element.value, request.url ),
                    imageFile: element.dataset['img'] ? element.dataset.img : null
                } ) );
                callback( null, pageLinks );
            } )
            .catch( error => {
                console.error( error, chapter );
                callback( error, undefined );
            } );
    }

    /**
     *
     */
    _handleConnectorURI( payload ) {
        let uri = new URL( payload.imageURL );
        let file = payload.imageFile;
        /*
         * TODO: only perform requests when from download manager
         * or when from browser for preview and selected chapter matches
         */
        return fetch( uri.href, this.requestOptions )
            .then( response => response.text() )
            .then( data => {
                let dom = this.createDOM( data );
                let img = dom.querySelector( 'div#image' );
                if( !img || !img.dataset['src'] ) {
                    throw new Error( 'No element with id #image found in page, or dataset.src is missing!' );
                }
                let link = new URL( img.dataset.src, uri.origin );
                if( file ) {
                    link.pathname = link.pathname.split( '/' ).slice( 0, -1 ).join( '/' ) + '/' + file;
                }
                /*
                 * +++ NOT SCRAMBLED +++
                 *   <script src="/js/iYFbYi.js">
                 *   <script src="/js/iYFbYi_Fee_gb_NbY.js">
                 * +++ SCRAMBLED +++
                 *   <script src="/js/iYFbYi_UibMqYb.js">
                 *   <script src="/js/iYFbYi_Fee_gb_NbY_UibMqYb.js">
                 */
                if( data.indexOf( '_UibMqYb.js' ) > -1 ) {
                    return this._getImageDescrambled( link.href );
                } else {
                    return this._getImageRaw( link.href );
                }
            } )
            .then( data => {
                this._applyRealMime( data );
                return Promise.resolve( data );
            } );
    }

    /**
     *
     */
    _getImageRaw( url ) {
        return fetch( url, this.requestOptions )
            .then( response => response.blob() )
            .then( data => {
                return this._blobToBuffer( data );
            } );
    }

    /**
     *
     */
    _getImageDescrambled( url ) {
        return fetch( url, this.requestOptions )
            .then( response => response.blob() )
            .then( data => createImageBitmap( data ) )
            .then( bitmap => {
                // TODO: find better detection to determine which descramble algorithm to use
                if( url.startsWith( this.urlCDN + 'cr_images' ) ) {
                    return this._descrambleCR( bitmap );
                }
                if( url.startsWith( this.urlCDN + 'clel' ) ) {
                    return this._descrambleCLEL( bitmap );
                }
                if( url.startsWith( this.urlCDN + 'lel' ) ) {
                    return this._descrambleCLEL( bitmap );
                }
                throw new Error( `The image descrambling for '${url}' is not yet supported!` );
            } )
            .then( data => this._blobToBuffer( data ) );
    }

    /**
     *
     */
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

    /**
     *
     */
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

    /**
     *
     */
    _getTilePosition( tile, tileCount, tileSize ) {
        return tile % 2 == 0 && tileCount - 2 == tile ? (tile - 1) * tileSize + tileSize : tileCount - 1 == tile ? (tile - 1) * tileSize + tileSize : tile % 2 != 0 ? (tile - 1) * tileSize : (tile + 1) * tileSize;
    }
}