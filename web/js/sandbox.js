// sandbox prevents access to any electron module and any webapp class

var sandboxOwnProperties = [ 'eval', 'sandboxOwnProperties' ];
// try to disable all unneccessary interfaces to prevent hijacking
for( let property in this ) {
    sandboxOwnProperties.push( property );
    // only keep a bare minimum of interfaces (these can also be used by the injected script)
    if( 
        property !== 'sandboxOwnProperties'
        && property !== 'addEventListener'
        && property !== 'postMessage'
        && property !== 'console'
    ) {
        if( this[property] ) {
            try{
                Object.setPrototypeOf( this[property], null );
            } catch ( e ) {
                //console.log( 'catch', property );
            }
        }
    }
}

/**
 * Evaluate the message as JS code
 */
addEventListener( 'message', function( e ) {
    // invalid message data
    if( !e
        || !e.data
        || !e.data.id
        || !e.data.content
        || typeof(e.data.content) !== 'string'
    ) {
        return;
    }
    // prevent injecting suspicious code
    for( let property of sandboxOwnProperties ) {
        let re = new RegExp( '(?:^|[^a-zA-Z0-9_])' + property + '(?:[^a-zA-Z0-9_]|$)' );
        if( e.data.content.match( re ) ) {
            console.warn( 'Blocked attempt to inject code into sandbox with access to <' + property + '>' );
            return;
        }
    }
    // indirect eval to run on global scope
    let evaluate = eval;
    evaluate( e.data.content );
    // extract all properties that were created by the injected script
    let sandboxAttachedProperties = [];
    for( let property in this ) {
        // do not add results when a list of certain variables was given and the property is not in the list
        if( e.data.return && e.data.return.indexOf( property ) < 0 ) {
            continue;
        }
        if( !sandboxOwnProperties.includes(property) && typeof( this[property] ) != 'function' ) {
            try {
                JSON.stringify( this[property] );
                sandboxAttachedProperties[property] = this[property];
            } catch (e) {
                // property cannot be posted from web worker
            }
        }
    }
    // return all current global variables created by injections
    postMessage( { id: e.data.id, content: sandboxAttachedProperties } );
}, false );
