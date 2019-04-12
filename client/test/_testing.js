var counter = 1000;

module.exports = {
    assert : {
        equal: function( expected, actual, message ) {
            // TODO (2017-10-04): JSON serialization to ensure deep comparison
            if( expected !== actual ) {
                counter++;
                console.log( '[' + counter + '] ' + 'Failed Assert.equal()', expected, actual, message );
                throw new Error( '[' + counter + '] ' + message );
            }
        },
        nequal: function( expected, actual, message ) {
            // TODO (2017-10-04): JSON serialization to ensure deep comparison
            if( expected === actual ) {
                counter++;
                console.log( '[' + counter + '] ' + 'Failed Assert.nequal()', expected, actual, message );
                throw new Error( '[' + counter + '] ' + message );
            }
        }
    }
}