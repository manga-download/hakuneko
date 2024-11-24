export default class HeaderGenerator {

    static _rn( min, max ) {
        return Math.floor( Math.random() * ( max - min + 1 ) ) + min;
    }

    static _rd( items ) {
        return items[ Math.floor( Math.random() * items.length ) ];
    }

    static get _osUnix() {
        let $ = HeaderGenerator;
        let arch = [' i386', ' i686', ' amd64', ' x86_64'];
        let unix = ['X11; Linux', 'X11; OpenBSD', 'X11; Ubuntu; Linux'];
        return $._rd( unix ) + $._rd( arch );
    }

    static get _osMacOSX() {
        let $ = HeaderGenerator;
        let sep = ['_', '.'];
        let major = ['10'];
        let minor = ['8', '9', '10', '11', '12', '13'];
        let patch = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10'];
        let version = [ $._rd( major ), $._rd( minor ), $._rd( patch ) ].join( $._rd( sep ) );
        return 'Macintosh; Intel Mac OS X ' + version;
    }

    static get _osWindows() {
        let $ = HeaderGenerator;
        let arch = ['', '; WOW64', '; Win64; x64'];
        let version = $._rd( ['5.0', '5.1', '5.2', '6.0', '6.1', '6.2', '6.3', '10.0', '10.1'] );
        return 'Windows NT ' + version + $._rd( arch );
    }

    static get _os() {
        let $ = HeaderGenerator;
        let os = [$._osUnix, $._osMacOSX, $._osWindows];
        return $._rd( os );
    }

    static get _browserChrome() {
        let $ = HeaderGenerator;
        let version = $._rn( 120, 122 ) + '.' + $._rn( 0, 99 ) + '.' + $._rn( 0, 9999 ) + '.' + $._rn( 0, 999 );
        return 'Mozilla/5.0 (' + $._os + ') AppleWebKit/537.36 (KHTML, like Gecko) Chrome/' + version + ' Safari/537.36';
    }

    static get _browserFirefox() {
        let $ = HeaderGenerator;
        let version = $._rn( 105, 114 );
        return 'Mozilla/5.0 (' + $._os + '; rv:' + version + '.0) Gecko/20100101 Firefox/' + version + '.0';
    }

    static get _browserIE() {
        let $ = HeaderGenerator;
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

    static get lang() {
        let $ = HeaderGenerator;

        let langCodes = ['af', 'sq', 'ar', 'ar-dz', 'ar-bh', 'ar-eg', 'ar-iq', 'ar-jo', 'ar-kw', 'ar-lb', 'ar-ly', 'ar-ma', 'ar-om', 'ar-qa', 'ar-sa', 'ar-sy', 'ar-tn', 'ar-ae', 'ar-ye', 'ar', 'hy', 'as', 'ast', 'az', 'eu', 'bg', 'be', 'bn', 'bs', 'br', 'bg', 'my', 'ca', 'ch', 'ce', 'zh', 'zh-hk', 'zh-cn', 'zh-sg', 'zh-tw', 'cv', 'co', 'cr', 'hr', 'cs', 'da', 'nl', 'nl-be', 'en', 'en-au', 'en-bz', 'en-ca', 'en-ie', 'en-jm', 'en-nz', 'en-ph', 'en-za', 'en-tt', 'en-gb', 'en-us', 'en-zw', 'eo', 'et', 'fo', 'fa', 'fj', 'fi', 'fr', 'fr-be', 'fr-ca', 'fr-fr', 'fr-lu', 'fr-mc', 'fr-ch', 'fy', 'fur', 'gd', 'gd-ie', 'gl', 'ka', 'de', 'de-at', 'de-de', 'de-li', 'de-lu', 'de-ch', 'el', 'gu', 'ht', 'he', 'hi', 'hu', 'is', 'id', 'iu', 'ga', 'it', 'it-ch', 'ja', 'kn', 'ks', 'kk', 'km', 'ky', 'tlh', 'ko', 'ko-kp', 'ko-kr', 'la', 'lv', 'lt', 'lb', 'mk', 'ms', 'ml', 'mt', 'mi', 'mr', 'mo', 'nv', 'ng', 'ne', 'no', 'nb', 'nn', 'oc', 'or', 'om', 'fa', 'fa-ir', 'pl', 'pt', 'pt-br', 'pa', 'pa-in', 'pa-pk', 'qu', 'rm', 'ro', 'ro-mo', 'ru', 'ru-mo', 'sz', 'sg', 'sa', 'sc', 'gd', 'sd', 'si', 'sr', 'sk', 'sl', 'so', 'sb', 'es', 'es-ar', 'es-bo', 'es-cl', 'es-co', 'es-cr', 'es-do', 'es-ec', 'es-sv', 'es-gt', 'es-hn', 'es-mx', 'es-ni', 'es-pa', 'es-py', 'es-pe', 'es-pr', 'es-es', 'es-uy', 'es-ve', 'sx', 'sw', 'sv', 'sv-fi', 'sv-sv', 'ta', 'tt', 'te', 'th', 'tig', 'ts', 'tn', 'tr', 'tk', 'uk', 'hsb', 'ur', 've', 'vi', 'vo', 'wa', 'cy', 'xh', 'ji', 'zu'];
        return new Array($._rn(1, 3)).fill().map(function () {
            return $._rd(langCodes) + ($._rn(0, 1) ? ';q=' + Math.random().toString().substr(0, 3) : '');
        }).join(' ');
    }

    static randomLang() {
        let $ = HeaderGenerator;
        return $.lang;
    }

    static randomUA() {
        let $ = HeaderGenerator;
        /*
         *return $._rd( [$._browserChrome, $._browserFirefox, $._browserIE] );
         * only return chrome because it has over 7E+014 signature possibilites
         * => low chance of duplicate calls
         * (firefox only has 0.6E+006 signature possiblities)
         */
        return $._browserChrome;
    }
}
