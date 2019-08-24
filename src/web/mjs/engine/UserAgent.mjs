export default class UserAgent {

    static _rn( min, max ) {
        return Math.floor( Math.random() * ( max - min + 1 ) ) + min;
    }

    static _rd( items ) {
        return items[ Math.floor( Math.random() * items.length ) ];
    }

    static get _osUnix() {
        let $ = UserAgent;
        let arch = [' i386', ' i686', ' amd64', ' x86_64'];
        let unix = ['X11; Linux', 'X11; OpenBSD', 'X11; Ubuntu; Linux'];
        return $._rd( unix ) + $._rd( arch );
    }

    static get _osMacOSX() {
        let $ = UserAgent;
        let sep = ['_', '.'];
        let major = ['10'];
        let minor = ['8','9', '10', '11', '12', '13'];
        let patch = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10'];
        let version = [ $._rd( major ), $._rd( minor ), $._rd( patch ) ].join( $._rd( sep ) );
        return 'Macintosh; Intel Mac OS X ' + version;
    }

    static get _osWindows() {
        let $ = UserAgent;
        let arch = ['', '; WOW64', '; Win64; x64'];
        let version = $._rd( ['5.0', '5.1', '5.2', '6.0', '6.1', '6.2', '6.3', '10.0', '10.1'] );
        return 'Windows NT ' + version + $._rd( arch );
    }

    static get _os() {
        let $ = UserAgent;
        let os = [$._osUnix, $._osMacOSX, $._osWindows];
        return $._rd( os );
    }

    static get _browserChrome() {
        let $ = UserAgent;
        let version = $._rn( 50, 66 ) + '.' + $._rn( 0, 99 ) + '.' + $._rn( 0, 9999 ) + '.' + $._rn( 0, 999 );
        return 'Mozilla/5.0 (' + $._os + ') AppleWebKit/537.36 (KHTML, like Gecko) Chrome/' + version + ' Safari/537.36';
    }

    static get _browserFirefox() {
        let $ = UserAgent;
        let version = $._rn( 45, 60 );
        return 'Mozilla/5.0 (' + $._os + '; rv:' + version + '.0) Gecko/20100101 Firefox/' + version + '.0';
    }

    static get _browserIE() {
        let $ = UserAgent;
        let version = $._rn( 8, 10 ) + '.0';
        let trident = $._rn( 5, 8 ) + '.0';
        let rv = $._rd( ['', '; rv:7.0', '; rv:8.0', '; rv:9.0', '; rv:10.0', '; rv:11.0'] );
        let suffix = $._rd( ['', ' like Gecko'] );
        let prefix = $._rd( [
            '',
            'Internet Explorer ' + version + '; ',
            'compatible; MSIE ' + version + '; ',
        ] );
        return 'Mozilla/5.0 (' + prefix + $._osWindows + '; Trident/' + trident + rv + ')' + suffix;
    }

    /**
     *
     */
    static random() {
        let $ = UserAgent;
        /*
         *return $._rd( [$._browserChrome, $._browserFirefox, $._browserIE] );
         * only return chrome because it has over 7E+014 signature possibilites
         * => low chance of duplicate calls
         * (firefox only has 0.6E+006 signature possiblities)
         */
        return $._browserChrome;
    }
}