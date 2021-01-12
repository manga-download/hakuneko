export default class languageHeaderGenerator {

    static _rn(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    static _rd(items) {
        return items[Math.floor(Math.random() * items.length)];
    }

    static get lang() {
        let $ = languageHeaderGenerator;

        let langCodes = ['af', 'sq', 'ar', 'ar-dz', 'ar-bh', 'ar-eg', 'ar-iq', 'ar-jo', 'ar-kw', 'ar-lb', 'ar-ly', 'ar-ma', 'ar-om', 'ar-qa', 'ar-sa', 'ar-sy', 'ar-tn', 'ar-ae', 'ar-ye', 'ar', 'hy', 'as', 'ast', 'az', 'eu', 'bg', 'be', 'bn', 'bs', 'br', 'bg', 'my', 'ca', 'ch', 'ce', 'zh', 'zh-hk', 'zh-cn', 'zh-sg', 'zh-tw', 'cv', 'co', 'cr', 'hr', 'cs', 'da', 'nl', 'nl-be', 'en', 'en-au', 'en-bz', 'en-ca', 'en-ie', 'en-jm', 'en-nz', 'en-ph', 'en-za', 'en-tt', 'en-gb', 'en-us', 'en-zw', 'eo', 'et', 'fo', 'fa', 'fj', 'fi', 'fr', 'fr-be', 'fr-ca', 'fr-fr', 'fr-lu', 'fr-mc', 'fr-ch', 'fy', 'fur', 'gd', 'gd-ie', 'gl', 'ka', 'de', 'de-at', 'de-de', 'de-li', 'de-lu', 'de-ch', 'el', 'gu', 'ht', 'he', 'hi', 'hu', 'is', 'id', 'iu', 'ga', 'it', 'it-ch', 'ja', 'kn', 'ks', 'kk', 'km', 'ky', 'tlh', 'ko', 'ko-kp', 'ko-kr', 'la', 'lv', 'lt', 'lb', 'mk', 'ms', 'ml', 'mt', 'mi', 'mr', 'mo', 'nv', 'ng', 'ne', 'no', 'nb', 'nn', 'oc', 'or', 'om', 'fa', 'fa-ir', 'pl', 'pt', 'pt-br', 'pa', 'pa-in', 'pa-pk', 'qu', 'rm', 'ro', 'ro-mo', 'ru', 'ru-mo', 'sz', 'sg', 'sa', 'sc', 'gd', 'sd', 'si', 'sr', 'sk', 'sl', 'so', 'sb', 'es', 'es-ar', 'es-bo', 'es-cl', 'es-co', 'es-cr', 'es-do', 'es-ec', 'es-sv', 'es-gt', 'es-hn', 'es-mx', 'es-ni', 'es-pa', 'es-py', 'es-pe', 'es-pr', 'es-es', 'es-uy', 'es-ve', 'sx', 'sw', 'sv', 'sv-fi', 'sv-sv', 'ta', 'tt', 'te', 'th', 'tig', 'ts', 'tn', 'tr', 'tk', 'uk', 'hsb', 'ur', 've', 'vi', 'vo', 'wa', 'cy', 'xh', 'ji', 'zu'];
        return new Array($._rn(1, 3)).fill().map(function () {
            return $._rd(langCodes) + ($._rn(0, 1) ? ';q=' + Math.random().toString().substr(0, 3) : '');
        }).join(' ');
    }

    static random() {
        let $ = languageHeaderGenerator;
        return $.lang;
    }
}