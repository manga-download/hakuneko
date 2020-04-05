export default class Favorites {

    constructor(ipc) {
        ipc.listen('on-connector-protocol-handler', this._onConnectorProtocolHandler.bind(this));
        this._list = [];
    }

    async _loadPlugins(uri) {
        try {
            let response = await fetch(uri);
            let data = await response.json();
            let cc = data.filter(plugin => plugin.startsWith('hakuneko.mangas.'));
            let connectorName = [];
            cc.forEach(file => {
                let name = file.substr(file.indexOf('.', 15)+1);
                connectorName.push("hakuneko://cache/mjs/connectors/" + name + ".mjs");
            });
            return connectorName;
        } catch(error) {
            //console.warn(error);
            return [];
        }
    }

    async initialize() {
        let favoritePlugins = await this._loadPlugins('hakuneko://root/');
        await this.register(favoritePlugins);
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

    async _onConnectorProtocolHandler(request) {
        try {
            let uri = new URL(request.url);
            return this._list.find(connector => connector.id === uri.hostname).handleConnectorURI(uri);
        } catch(error) {
            console.error(error);
            return undefined;
        }
    }
}