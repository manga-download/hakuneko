export default class Connectors {

    constructor(request) {
        request.registerProtocol( 'connector', this._protocolHandler.bind( this ) );
        this._list = [];
    }

    async _loadPlugins(uri) {
        try {
            let response = await fetch(uri);
            let data = await response.json();
            return data.filter(plugin => !plugin.startsWith('.') && plugin.endsWith('.mjs')).map(plugin => uri + plugin)
        } catch(error) {
            //console.warn(error);
            return [];
        }
    }

    async initialize() {
        const systemPlugins = [
            '../connectors/system/BookmarkConnector.mjs',
            '../connectors/system/FolderConnector.mjs',
            '../connectors/system/ClipboardConnector.mjs'
        ];
        let userPlugins = await this._loadPlugins('hakuneko://plugins/');
        let internalPlugins = await this._loadPlugins('hakuneko://cache/mjs/connectors/');

        await this.register(systemPlugins);
        await this.register(userPlugins);
        await this.register(internalPlugins);
    }

    get list() {
        return this._list;
    }

    async register(files) {
        try {
            for(let file of files) {
                try {
                    let module = await import(file);
                    let connector = new module.default();
                    if(this._list.find(c => c.id === connector.id)) {
                        console.warn(`The connector "${connector.label}" with ID "${connector.id}" is already registered`);
                    } else {
                        this._list.push(connector);
                    }
                } catch(error) {
                    console.warn(`Failed to load connector "${file}"`, error);
                }
            }
            this._list.sort( ( a, b ) => {
                return ( a.label.toLowerCase() < b.label.toLowerCase() ? -1 : 1 );
            } );
        } catch(error) {
            console.warn(`Failed to load connector`, error);
        }
    }
    
    _protocolHandler( request, callback ) {
        let uri = new URL( request.url );
        this._list.find( connector => connector.id === uri.hostname ).handleConnectorURI( uri )
        .then( buffer => callback( buffer ) )
        .catch( error => {
            //console.error( error, payload );
            callback( undefined );
        } );
    }
}