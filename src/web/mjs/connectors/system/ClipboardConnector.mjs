/**
 * System
 * A special connector that allows to use manga links from the clipboard.
 * This connector does not implement the connector base class, because it operates different.
 */
export default class ClipboardConnector {

    /**
     *
     */
    constructor() {
        // Public members for usage in UI (mandatory)
        this.id = 'clipboard';
        this.label = ' 【Clipboard】';
        this.icon = '/img/connectors/' + this.id;
        this.tags = [];
        this.isLocked = false;
        // Private members for internal usage only (convenience)
        this.url = undefined;
        this.referer = undefined;
        this.agent = undefined;
        // Private members for internal use that can be configured by the user through settings menu (set to undefined or false to hide from settings menu!)
        this.config = undefined;

        this.linkMap = [];
    }

    /**
     *
     */
    _getLinksFromClipboard() {
        /*
         * TODO: get links from clipboard...
         * navigator.clipboard.readText().then( text => console.log( 'DBG:', text) );
         */
        return [];
    }

    /**
     *
     */
    initialize( mangaLinks ) {
        let links = mangaLinks || this._getLinksFromClipboard();
        links = links.map( link => {
            try {
                let uri = new URL( link );
                if( uri.pathname.length < 2 ) {
                    throw new Error( 'The URL path seems invalid ' + uri.pathname );
                }
                let connectors = Engine.Connectors.filter( connector => connector.url === uri.origin );
                if( !connectors.length ) {
                    connectors = Engine.Connectors.filter( connector => connector.url && connector.url.includes( uri.hostname ) );
                }
                if( connectors.length > 1 ) {
                    connectors = connectors.filter( connector => uri.pathname.startsWith( new URL( connector.url ).pathname ) );
                }
                if( !connectors.length ) {
                    throw new Error( 'No matching connector found for URL ' + link );
                }
                if( connectors.length > 1 ) {
                    throw new Error( 'To many matching connectors found for URL ' + link );
                }
                return {
                    uri: uri,
                    connector: connectors[0]
                };
            } catch( error ) {
                console.warn( 'CLIPBOARD:', error.message, link );
                return null;
            }
        } );
        this.linkMap = links.filter( link => link );
        return this.linkMap.length > 0;
    }

    /**
     *
     */
    updateMangas( callback ) {
        if( this.initialize() ) {
            this._getMangaList( callback );
        } else {
            callback( new Error( 'Updating clipboard not yet supported!\nUse "CTRL+V" or the "Paste from Clipboard" button.' ), undefined );
        }
    }

    /**
     *
     */
    getMangas( callback ) {
        this._getMangaList( callback );
    }

    /**
     *
     */
    _getMangaList( callback ) {
        let promises = this.linkMap.map( entry => entry.connector.getMangaFromURI( entry.uri ).catch( error => {
            console.warn( 'CLIPBOARD:', error.message, entry.uri.href );
            return Promise.resolve( error );
        } ) );
        Promise.all( promises )
            .then( mangas => {
                mangas = mangas.filter( manga => !(manga instanceof Error) );
                callback( null, mangas );
            } );
    }
}