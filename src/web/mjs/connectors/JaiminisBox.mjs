import FoolSlide from './templates/FoolSlide.mjs';

export default class JaiminisBox extends FoolSlide {

    constructor() {
        super();
        super.id = 'jaiminisbox';
        super.label = 'JaiminisBox';
        this.tags = [ 'manga', 'high-quality', 'english', 'scanlation' ];
        this.url = 'https://jaiminisbox.com';
        this.path = '/reader/directory/';
        this.language = 'english';
    }

    async _getPages(chapter) {
        let uri = new URL(chapter.id, this.url);
        let request = new Request(uri, {
            method: 'POST',
            body: 'adult=true',
            headers: {
                'content-type': 'application/x-www-form-urlencoded'
            }
        });
        let response = await fetch(request);
        let data = await response.text();
        let encrypted = data.match(/['"]fromCharCode['"]\s*,\s*['"]([^'"]+)['"]/);
        if(encrypted instanceof Array) {
            return this._decrypt(encrypted[1]).map(page => this.getAbsolutePath(page.url, request.url));
        } else {
            return super._getPages(chapter);
        }
    }

    // Encapsulated code from website ...
    _decrypt(encrypted) {
        var _0x3320 = ['fromCharCode', encrypted];
        (function(_0x390ee2, _0x332043) {
            var _0x5847de = function(_0x504e99) {
                while (--_0x504e99) {
                    _0x390ee2['push'](_0x390ee2['shift']());
                }
            };
            _0x5847de(++_0x332043);
        }(_0x3320, 0x153));

        var _0x5847 = function(_0x390ee2/*, _0x332043*/) {
            _0x390ee2 = _0x390ee2 - 0x0;
            var _0x5847de = _0x3320[_0x390ee2];
            return _0x5847de;
        };

        var pages = JSON['parse'](atob(_0x5847('0x0')['replace'](/[a-zA-Z]/g, function(_0x554ef5) {
            return String[_0x5847('0x1')]((_0x554ef5 <= 'Z' ? 0x5a : 0x7a) >= (_0x554ef5 = _0x554ef5['charCodeAt'](0x0) + 0xd) ? _0x554ef5 : _0x554ef5 - 0x1a);
        })));

        return pages;
    }
}