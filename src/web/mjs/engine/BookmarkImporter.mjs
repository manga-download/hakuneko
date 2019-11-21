export default class BookmarkImporter {

    constructor() {
        /*
         * A map from FMD connector IDs to HakuNeko connector IDs
         * The key is based on FMD connector IDs
         */
        this._connectorMap = {
            '3asq': 'mangalover-archive',
            '3asqorg': 'mangalover',
            'acqqcom': 'tencentcomic',
            'artemisnf': 'artemisnofansub',
            'comicocoid': 'comicoid',
            'copypastescanlation': 'copypastescan',
            'coyuhi': 'universoyuri',
            'darkskyscan': 'darkskyprojects',
            'desume': 'desu',
            'doujinscom': 'doujins',
            'dynastyscans': 'dynasty-scans',
            'e-hentai': 'ehentai',
            'goodmanga': 'mangareader',
            'hentaichanru': 'henchan',
            'hitomila': 'hitomi',
            'hunterfansubscan': 'hunterfansub',
            'komikindowebid': 'komikindoweb',
            'leitornet': 'leitor',
            'lhscans': 'lhscan',
            'maidmangaid': 'maid',
            'manga-tr': 'mangatr',
            'mangaae': 'mangaarab',
            'mangaarab': 'allmanga',
            'mangabb': 'mangareader',
            'mangacan': 'mangacanblog',
            'mangachanru': 'mangachan',
            'mangaeden': 'mangaeden-en',
            'mangaeden_it': 'mangaeden-it',
            'mangaf': 'mangaforall',
            'mangahubio': 'mangahub',
            'mangaichiscan': 'mangaichiscans',
            'mangaindo': 'mangaindoweb',
            'mangaindonet': 'mangaindo',
            'manganelo': 'manganel',
            'mangaonlinebiz': 'mangaonline',
            'mangapark': 'mangapark-en',
            'mangaparkcom': 'mangapark-en',
            'mangaparknet': 'mangapark-en',
            'mangaparkorg': 'mangapark',
            'mangatoon': 'mangatoon-en',
            'mangatooncn': 'mangatoon-cn',
            'mangatoonid': 'mangatoon-id',
            'mangatoonsp': 'mangatoon-es',
            'mangatoonvi': 'mangatoon-vi',
            'mangazuki': 'mangazuki-scans',
            'mangazukionline': 'mangazuki-online',
            'mangazukiraws': 'mangazuki-raws',
            'manhwaco': 'sleepypandascans',
            'manhwahentai': 'manhwahentaime',
            'mintmangaru': 'mintmanga',
            'neoprojectscan': 'neoprojectscans',
            'ninemanga': 'ninemanga-en',
            'ninemangabr': 'ninemanga-br',
            'ninemangade': 'ninemanga-de',
            'ninemangaes': 'ninemanga-es',
            'ninemangait': 'ninemanga-it',
            'ninemangaru': 'ninemanga-ru',
            'perveden_it': 'perveden-it',
            'pocketangelscan': 'pocketangelscans',
            'ravensscans': 'ravensscans-es',
            'readcomiconline': 'kisscomic',
            'readcomicsonlineru': 'readcomicsonline',
            'readmangaru': 'readmanga',
            'readmangatoday': 'readmng',
            'seinagifansub': 'seinagifansub-es',
            'selfmangaru': 'selfmanga',
            'sundaywebevery': 'sundaywebry',
            'tmohentai': 'tumangaonlinehentai',
            'translatewebtoon': 'linewebtoon-translate',
            'webtoons': 'linewebtoon-en',
            'yaoichanru': 'yaoichan',
            'yuri-ism': 'yuriism'
        };
        /*
         * A map of converter functions to transform FMD manga IDs to HakuNeko manga IDs
         * The key is based on HakuNeko connector IDs
         */
        this._mangaMap = {
            'mangadex': id => id.match( /^\/[a-z]+\/(\d+)($|\/.*$)/ )[1],
            'mangarock': id => id.split( '/' ).pop(),
            //'mangapark': id => ( id.indexOf( '/series' ) > -1 ? id : undefined ),
            'mangatube': id => id.split( '/' ).pop()
        };
    }

    /**
     *
     */
    async importBookmarks( file ) {
        if( file.size < 2 ) {
            throw new Error( `Invalid file size: ${file.size}` );
        }
        if( file.type === 'application/x-sqlite3' || file.name.endsWith( '.db' ) ) {
            return await this._importBookmarksFMD( file );
        }
        throw new Error(`File type '${file.type}' is not supported!`);
    }

    /**
     *
     */
    async _importBookmarksFMD( file ) {
        return new Promise( resolve => {
            let fileReader = new FileReader();
            fileReader.onload = event => {
                let db = new window.SQL.Database( new Uint8Array( event.target.result ) );
                let query = 'SELECT `websitelink` AS `key.combined`, `link` AS `key.manga`, `website` AS `title.connector`, `title` AS `title.manga` FROM `favorites`;';
                let result = db.exec( query );
                //let columns = result[0].columns;
                let rows = result[0].values;
                let bookmarks = rows.map( this._mapFMDRowToManga.bind( this ) );
                resolve( bookmarks );
            };
            fileReader.readAsArrayBuffer( file );
        } );
    }

    /**
     *
     */
    _mapFMDRowToManga(row) {
        // NOTE: due to a bug in FMD sometimes the connector has 'http' postfix which needs to be removed
        let connectorID = this._mapFMDConnectorID( row[0].replace( /http[s]?:/, '' ).split( '/' )[0] );
        let mangaID = this._mapFMDMangaID( connectorID, new URL( row[1], 'http://hostname.dummy' ).pathname );
        return {
            key: {
                connector: connectorID,
                manga: mangaID
            },
            title: {
                connector: row[2],
                manga: row[3]
            }
        };
    }

    /**
     * Find the corresponding HakuNeko connector ID for the given FMD website ID
     */
    _mapFMDConnectorID( connectorFMD ) {
        let connectorID = this._connectorMap[connectorFMD];
        return connectorID ? connectorID : connectorFMD ;
    }

    /**
     * Find the corresponding HakuNeko manga ID for the given FMD website ID
     */
    _mapFMDMangaID( connectorID, mangaFMD ) {
        let mangaConvert = this._mangaMap[connectorID];
        return mangaConvert ? mangaConvert( mangaFMD ) : mangaFMD ;
    }
}