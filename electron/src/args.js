var args = {};

args.getArg = function(shortOption, longOption) {
    index = process.argv.findIndex( (arg) => { return( arg === shortOption || arg === longOption ); });
    index++;
    if( index > 0 && index < process.argv.length ) {
        return process.argv[index];
    }
    return undefined;
}

/**
 * Export the configuration module
 */
module.exports = args;