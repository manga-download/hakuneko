import Connector from '../../engine/Connector.mjs';

/**
 * System
 * A connector that can be used as invalid / empty connector
 * e.g. for backward compatibility of bookmarked connectors that no longer exist.
 */
export default class InvalidConnector extends Connector {

    constructor( id, label ) {
        super();
        super.id = id;
        super.label = label;
    }

    /**
     *
     */
    _getMangaList( callback ) {
        callback( new Error( `${this.label} is no longer available!` ), [] );
    }

    /**
     *
     */
    _getChapterList( manga, callback ) {
        callback( new Error( `${this.label} is no longer available!` ), [] );
    }

    /**
     *
     */
    _getPageList( manga, chapter, callback ) {
        callback( new Error( `${this.label} is no longer available!` ), [] );
    }
}