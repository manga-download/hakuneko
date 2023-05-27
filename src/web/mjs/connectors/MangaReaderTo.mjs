import Connector from '../engine/Connector.mjs';
import Manga from '../engine/Manga.mjs';

export default class MangaReaderTo extends Connector {

    constructor() {
        super();
        super.id = 'mangareaderto';
        super.label = 'MangaReader.to';
        this.tags = ['manga', 'webtoon', 'japanese', 'korean', 'english', 'chinese', 'french'];
        this.url = 'https://mangareader.to';
        this.path = '/az-list?page=';

        this.queryMangaTitleFromURI = 'div#ani_detail div.anisc-detail h2.manga-name';
        this.queryMangas = '#main-content div.manga-detail h3 a';
        this.queryChapters = 'div.chapters-list-ul ul li a, div.volume-list-ul div.manga-poster';
        this.queryPages = 'div#wrapper';
        this.seedrandom = undefined;
    }

    async _initializeConnector() {
        this.init();
    }

    async _getMangaFromURI(uri) {
        const request = new Request(new URL(uri), this.requestOptions);
        const data = await this.fetchDOM(request, this.queryMangaTitleFromURI);
        const id = uri.pathname;
        const title = data[0].textContent.trim();
        return new Manga(this, id, title);
    }

    async _getMangas() {
        const mangaList = [];
        for(let page = 1, run = true; run; page++) {
            const mangas = await this._getMangasFromPage(page);
            mangas.length ? mangaList.push(...mangas) : run = false;
        }
        return mangaList;
    }

    async _getMangasFromPage(page) {
        const uri = new URL(this.path + page, this.url);
        const request = new Request(uri, this.requestOptions);
        const data = await this.fetchDOM(request, this.queryMangas);
        return data.map(element => {
            return {
                id: this.getRootRelativeOrAbsoluteLink(element, this.url),
                title: element.title.trim()
            };
        });
    }

    async _getChapters(manga) {
        let uri = new URL(manga.id, this.url);
        let request = new Request(uri, this.requestOptions);
        let data = await this.fetchDOM(request, this.queryChapters);
        return data.map(element => {
            const link = this.getRootRelativeOrAbsoluteLink(element.tagName.toLowerCase() === 'a' ? element : element.querySelector('a'), this.url);
            const title = element.tagName.toLowerCase() === 'a' ? element.title.replace(/([^:]*):(.*)/, (match, g1, g2) => g1.trim().toLowerCase() === g2.trim().toLowerCase() ? g1 : match).trim() : element.textContent.trim();
            const lang = link.match(/(\/en\/)|(\/ja\/)|(\/ko\/)|(\/zh\/)|(\/fr\/)/gi);
            const language = lang ? lang[0].replace(/\//gm, '').toUpperCase() : '';
            return {
                id: link,
                title: title.replace(manga.title, '').trim() + ` (${language})` || manga.title,
                language
            };
        });
    }

    async _getPages(chapter) {
        const uri = new URL(chapter.id, this.url);
        const request = new Request(uri, this.requestOptions);
        const data = await this.fetchDOM(request, this.queryPages);
        const readingId = data[0].dataset.readingId;

        return this._getImages(request, readingId);
    }

    async _getImages(requestChapter, readingId) {
        // https://mangareader.to/ajax/image/list/chap/545260?mode=vertical&quality=high&hozPageSize=1
        // https://mangareader.to/ajax/image/list/vol/26758?mode=vertical&quality=high&hozPageSize=1
        const uri = new URL(`ajax/image/list/${requestChapter.url.includes('chapter') ? 'chap' : 'vol'}/${readingId}`, this.url);
        uri.searchParams.set('quality', 'high');
        const request = new Request(uri, this.requestOptions);
        const data = await this.fetchJSON(request, 3);

        const dom = this.createDOM(data.html);
        const imagesArr = Array.from(dom.querySelectorAll('.iv-card'));
        const shuffledImagesArr = imagesArr.filter(image => image.className.includes('shuffled'));

        if(!imagesArr.length || !shuffledImagesArr.length)
            return imagesArr.map(image => image.dataset.url);

        return imagesArr.map(image => {
            if (image.className.includes('shuffled')) {
                return this.createConnectorURI(image.dataset.url);
            }
            return image.dataset.url;
        });
    }

    async _handleConnectorURI(payload) {
        const type = Engine.Settings.recompressionFormat.value;
        const quality = parseFloat(Engine.Settings.recompressionQuality.value) / 100;
        let canvas = await this.imgReverser(payload);
        const blob = await new Promise(resolve => {
            canvas.toBlob(data => resolve(data), type, quality);
        });
        let data = await this._blobToBuffer(blob);
        this._applyRealMime(data);
        return data;

    }

    /**********************/
    /* Begin MangareaderTo*/
    /*********************/

    async _loadImage(url) {
        return new Promise((resolve, reject) => {
            const uri = new URL(url);
            let image = new Image();
            image.onload = () => resolve(image);
            image.onerror = error => reject(error);
            image.src = uri.href;
        });
    }

    //Slightly modified from Mangareader lambda that extends Math by adding Math.seedrandom  function.
    //1) Modified because we dont want to mess with modules.exports (i bet they have a node application to scramble and unscramble their pics)
    //2) Main purpose of init is to fill this.seedrandom with an adequate lambda to use for unscramblng pictures. Too lazy too debug all that maybe there is still useless code.
    init() {
        let _0xb2d0a3 = [];
        var _0x221936,
            _0x9c2b2f = Math.pow(256, 6),
            _0x2f77bc = Math.pow(2, 52),
            _0x252021 = 2 * _0x2f77bc,
            _0x45bef1 = 255;
        function _0x4b7e3b(_0xd1c90b, _0x55eb5c, _0x2a4bce) {
            function _0x1c4ba5() {
                for (
                    var _0x16995d = _0x1cf83a.g(6), _0x374e1e = _0x9c2b2f, _0x11164e = 0;
                    _0x16995d < _0x2f77bc;

                ) {
                    _0x16995d = (_0x16995d + _0x11164e) * 256;
                    _0x374e1e *= 256;
                    _0x11164e = _0x1cf83a.g(1);
                }
                for (; _0x252021 <= _0x16995d; ) {
                    _0x16995d /= 2;
                    _0x374e1e /= 2;
                    _0x11164e >>>= 1;
                }
                return (_0x16995d + _0x11164e) / _0x374e1e;
            }
            var _0x357c70 = [],
                _0xd1c90b = _0x459744(// eslint-disable-line
                    (function _0x53f196(_0x598061, _0xa97de4) {
                        var _0x4cb136,
                            _0x588b46 = [],
                            _0x5ee98e = typeof _0x598061;
                        if (_0xa97de4 && 'object' == _0x5ee98e) {
                            for (_0x4cb136 in _0x598061)
                                try {
                                    _0x588b46.push(_0x53f196(_0x598061[_0x4cb136], _0xa97de4 - 1));
                                } catch (_0x1f24ad) {
                                //
                                }
                        }
                        return _0x588b46.length
                            ? _0x588b46
                            : 'string' == _0x5ee98e
                                ? _0x598061
                                : _0x598061 + '\0';
                    })(
                        (_0x55eb5c = 1 == _0x55eb5c ? { entropy: true } : _0x55eb5c || {})
                            .entropy
                            ? [_0xd1c90b, _0x8285a6(_0xb2d0a3)]
                            : null == _0xd1c90b
                                ? (function () {
                                    try {
                                        var _0x62b9e7;
                                        return (
                                            _0x221936 && (_0x62b9e7 = _0x221936.randomBytes)
                                                ? _0x62b9e7 = _0x62b9e7(256)
                                                : (_0x62b9e7 = new Uint8Array(256),
                                                (
                                                    window.crypto || window.msCrypto
                                                ).getRandomValues(_0x62b9e7)),
                                            _0x8285a6(_0x62b9e7)
                                        );
                                    } catch (_0x26103d) {
                                        let _0x3dfeac = window.navigator;
                                        _0x3dfeac = _0x3dfeac && _0x3dfeac.plugins;
                                        return [
                                            +new Date(),
                                            window,
                                            _0x3dfeac,
                                            window.screen,
                                            _0x8285a6(_0xb2d0a3),
                                        ];
                                    }
                                })()
                                : _0xd1c90b,
                        3
                    ),
                    _0x357c70
                ),
                _0x1cf83a = new _0x35ec90(_0x357c70);
            return (
                _0x1c4ba5.int32 = function () {
                    return 0 | _0x1cf83a.g(4);
                },
                _0x1c4ba5.quick = function () {
                    return _0x1cf83a.g(4) / 4294967296;
                },
                _0x1c4ba5.double = _0x1c4ba5,
                _0x459744(_0x8285a6(_0x1cf83a.S), _0xb2d0a3),
                (
                    _0x55eb5c.pass ||
        _0x2a4bce ||
        function (_0x4526b5, _0x337cae, _0x314183, _0x3034a8) {
            return (
                _0x3034a8 &&
              (_0x3034a8.S && _0x1ef076(_0x3034a8, _0x1cf83a),
              _0x4526b5.state = function () {
                  return _0x1ef076(_0x1cf83a, {});
              }),
                _0x314183 ? (Math.random = _0x4526b5, _0x337cae) : _0x4526b5
            );
        }
                )(
                    _0x1c4ba5,
                    _0xd1c90b,
                    'global' in _0x55eb5c ? _0x55eb5c.global : this == Math,
                    _0x55eb5c.state
                )
            );
        }
        function _0x35ec90(_0x245099) {
            var _0x9031c5,
                _0x22b051 = _0x245099.length,
                _0x25e728 = this,
                _0x249803 = 0,
                _0x5d5ca6 = _0x25e728.i = _0x25e728.j = 0,
                _0x1a5c28 = _0x25e728.S = [];
            for (_0x22b051 || (_0x245099 = [_0x22b051++]); _0x249803 < 256; ) {
                _0x1a5c28[_0x249803] = _0x249803++;
            }
            for (_0x249803 = 0; _0x249803 < 256; _0x249803++) {
                _0x1a5c28[_0x249803] =
        _0x1a5c28[
            _0x5d5ca6 =
            _0x45bef1 &
            _0x5d5ca6 +
              _0x245099[_0x249803 % _0x22b051] +
              (_0x9031c5 = _0x1a5c28[_0x249803])
        ];
                _0x1a5c28[_0x5d5ca6] = _0x9031c5;
            }
            (_0x25e728.g = function (_0x1dfa06) {
                for (
                    var _0x104e1c,
                        _0x551239 = 0,
                        _0x240549 = _0x25e728.i,
                        _0x41a3c2 = _0x25e728.j,
                        _0x4dddac = _0x25e728.S;
                    _0x1dfa06--;

                ) {
                    _0x104e1c = _0x4dddac[_0x240549 = _0x45bef1 & _0x240549 + 1];
                    _0x551239 =
          _0x551239 * 256 +
          _0x4dddac[
              _0x45bef1 &
              (_0x4dddac[_0x240549] =
                _0x4dddac[_0x41a3c2 = _0x45bef1 & _0x41a3c2 + _0x104e1c]) +
                (_0x4dddac[_0x41a3c2] = _0x104e1c)
          ];
                }
                return _0x25e728.i = _0x240549, _0x25e728.j = _0x41a3c2, _0x551239;
            })(256);
        }
        function _0x1ef076(_0x231ccf, _0x4ad540) {
            return (
                _0x4ad540.i = _0x231ccf.i,
                _0x4ad540.j = _0x231ccf.j,
                _0x4ad540.S = _0x231ccf.S.slice(),
                _0x4ad540
            );
        }
        function _0x459744(_0x34f89f, _0x49c1cd) {
            for (
                var _0x239996, _0x2dbab9 = _0x34f89f + '', _0x12b568 = 0;
                _0x12b568 < _0x2dbab9.length;

            ) {
                _0x49c1cd[_0x45bef1 & _0x12b568] =
        _0x45bef1 &
        (_0x239996 ^= 19 * _0x49c1cd[_0x45bef1 & _0x12b568]) +
          _0x2dbab9.charCodeAt(_0x12b568++);
            }
            return _0x8285a6(_0x49c1cd);
        }
        function _0x8285a6(_0x1dd83a) {
            return String.fromCharCode.apply(0, _0x1dd83a);
        }

        this.seedrandom = _0x4b7e3b;
    }

    extractSeed(a) {
        return !/(number|string)/i.test(Object.prototype.toString.call(a).match(/^\[object (.*)\]$/)[1]
        ) && isNaN(a)? Number(String(this.strSeed = a).split('').map(function (b) {
                return b.charCodeAt(0);
            }).join('')): a;
    }

    seedRand(a, b, c) {
        return Math.floor(a() * (c - b + 1)) + b;
    }

    unShuffle(a, b) {
        if (!Array.isArray(a)) {
            return null;
        }
        //Math.seedrandom && (seedrandom = Math.seedrandom);
        b = this.extractSeed(b) || 'none';
        var c = a.length,
            d = this.seedrandom(b);
        const arr = [],
            arr2 = [];
        for (var index = 0; index < c; index++) {
            arr.push(null);
            arr2.push(index);
        }
        for (index = 0; index < c; index++) {
            var e = this.seedRand(d, 0, arr2.length - 1),
                f = arr2[e];
            arr2.splice(e, 1);
            arr[f] = a[index];
        }
        return arr;
    }

    async imgReverser(imageURI, a = 200, b = 'stay') {
        const canvas = document.createElement('CANVAS'),
            ctx = canvas.getContext('2d');
            // var c = 0;
        let image = await this._loadImage(imageURI);

        image.crossOrigin = 'Anonymous';
        var d = Math.ceil(image.width / a) *Math.ceil(image.height / a);
        canvas.width = image.width;
        canvas.height = image.height;
        var e = Math.ceil(image.width / a);
        const f = [];
        for (var index = 0; index < d; index++) {
            var g = parseInt(index / e);
            const h = {x: (index - g * e) * a, y: g * a,};
            h.width =a -(h.x + a <= image.width? 0: h.x + a - image.width);
            h.height =a -(h.y + a <= image.height? 0: h.y + a - image.height);
            f[h.width + '-' + h.height] || (f[h.width + '-' + h.height] = []);
            f[h.width + '-' + h.height].push(h);
        }
        for (const i in f) {
            var j,
                k,
                l = this.unShuffle(this.createRange(0, f[i].length), b),
                m = this.getGroup(f[i]);
            for ([j, k] of f[i].entries()) {
                var n = l[j];
                var o = parseInt(n / m.cols);
                n = (n - o * m.cols) * k.width;
                o = o * k.height;
                ctx.drawImage(image,
                    m.x + n,
                    m.y + o,
                    k.width,
                    k.height,
                    k.x,
                    k.y,
                    k.width,
                    k.height
                );
            }
        }
        return canvas;

    }

    isObject(_0x36af8c) {
        var _0x293a47 = typeof _0x36af8c;
        return null != _0x36af8c && ('object' == _0x293a47 || 'function' == _0x293a47);
    }

    isSymbol(_0x2563af) {
        var _0x68d5dc = typeof _0x2563af;
        return 'symbol' == _0x68d5dc || 'object' == _0x68d5dc && null != _0x2563af; //&& '[object Symbol]' == getTag(_0x2563af);
    }

    toNumber(_0x40b6d8) {
        if ('number' == typeof _0x40b6d8) {
            return _0x40b6d8;
        }
        if (this.isSymbol(_0x40b6d8)) {
            return NaN;
        }
        if (
            'string' !=
    typeof (_0x40b6d8 = this.isObject(_0x40b6d8)
        ? this.isObject(
            _0x19ec12 =
            'function' == typeof _0x40b6d8.valueOf
                ? _0x40b6d8.valueOf()
                : _0x40b6d8
        )
            ? '' + _0x19ec12
            : _0x19ec12
        : _0x40b6d8)
        ) {
            return 0 === _0x40b6d8 ? _0x40b6d8 : +_0x40b6d8;
        }
        _0x40b6d8 = _0x40b6d8.replace(/^\s+|\s+$/g, '');
        var _0x19ec12 = /^0b[01]+$/i.test(_0x40b6d8);
        return _0x19ec12 || /^0o[0-7]+$/i.test(_0x40b6d8)
            ? parseInt(_0x40b6d8.slice(2), _0x19ec12 ? 2 : 8)
            : /^[-+]0x[0-9a-f]+$/i.test(_0x40b6d8)
                ? NaN
                : +_0x40b6d8;
    }

    toFinite(a) {
        return a? (a = this.toNumber(a)) !== 1e400 && a !== -1e400? a == a ? a: 0: 1.7976931348623157e308 * (a < 0 ? -1 : 1): 0 === a? a: 0;// eslint-disable-line
    }

    createRange(a, b, c) {
        return (
            a = this.toFinite(a),
            void 0 === b? (b = a, a = 0): b = this.toFinite(b),
            this.baseRange(a, b, c = void 0 === c? a < b? 1: -1: this.toFinite(c), false)
        );
    }

    getGroup(_0xb0244) {
        const _0x479dca = {
            slices: _0xb0244.length,
            cols: this.getColsInGroup(_0xb0244),
        };
        return (
            _0x479dca.rows = _0xb0244.length / _0x479dca.cols,
            _0x479dca.x = _0xb0244[0].x,
            _0x479dca.y = _0xb0244[0].y,
            _0x479dca
        );
    }

    baseRange(_0x5f1add, _0x142176, _0x34f9f6, _0x1ccbee) {
        var _0x3e82d2 = -1,
            _0x10b010 = Math.max(
                Math.ceil((_0x142176 - _0x5f1add) / (_0x34f9f6 || 1)),
                0
            );
        const _0x7ecf6b = new Array(_0x10b010);
        for (; _0x10b010--; ) {
            _0x7ecf6b[_0x1ccbee ? _0x10b010 : ++_0x3e82d2] = _0x5f1add;
            _0x5f1add += _0x34f9f6;
        }
        return _0x7ecf6b;
    }

    getColsInGroup(_0x3fb66d) {
        if (1 === _0x3fb66d.length) {
            return 1;
        }
        for (
            var _0x21758c, _0xb540b2 = 0;
            _0xb540b2 < _0x3fb66d.length;
            _0xb540b2++
        ) {
            if (
                (_0x21758c =
        void 0 === _0x21758c ? _0x3fb66d[_0xb540b2].y : _0x21758c) !==
      _0x3fb66d[_0xb540b2].y
            ) {
                return _0xb540b2;
            }
        }
        return _0xb540b2;
    }

    /**********************/
    /* END  MangareaderTo*/
    /*********************/

}
