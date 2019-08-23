import WordPressMadara from './templates/WordPressMadara.mjs';

/**
 *
 */
export default class MuchoDoujins extends WordPressMadara {

    /**
     *
     */
    constructor() {
        super();
        super.id = 'muchodoujins';
        super.label = 'MuchoDoujins';
        this.tags = [ 'hentai', 'english' ];
        this.url = 'https://muchodoujins.com';

        require( 'electron' ).remote.require( 'electron' ).app.on( 'certificate-error', ( event, webContents, url, error, certificate, callback ) => {
            console.warn( 'Certificate Error:', url, error );
            event.preventDefault();
            callback( true );
        } );
    }
}