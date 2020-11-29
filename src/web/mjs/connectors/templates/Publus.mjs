import Connector from '../../engine/Connector.mjs';

export default class Publus extends Connector {

    constructor() {
        super();
        super.id = undefined;
        super.label = undefined;
        this.tags = [];
        this.url = undefined;
        // Private members for internal use that can be configured by the user through settings menu (set to undefined or false to hide from settings menu!)
        this.config = {
            scrapeDelay: {
                label: 'Page Scrape Delay',
                description: 'Time to wait until the page initialization process is complete.\nIncrease the value if no pages are found for the chapter.',
                input: 'numeric',
                min: 2500,
                max: 10000,
                value: 5000
            }
        };
    }

    async _getPages(chapter) {
        const script = `
            new Promise((resolve, reject) => {
                setTimeout(async () => {
                    try {
                        const a2f = NFBR.a2F ? new NFBR.a2F() : new NFBR.a2f();
                        const params = new URL(window.location).searchParams;
                        a2f.a5W({
                            contentId: params.get(NFBR.a5q.Key.CONTENT_ID), // Content ID => 'cid'
                            a6m: params.get(NFBR.a5q.Key.LICENSE_TOKEN), // License Token => 'lit'
                            preview: params.get(NFBR.a5q.Key.LOOK_INSIDE) === '1', // Look Inside => 'lin'
                            contentType: params.get(NFBR.a5q.Key.CONTENT_TYPE) || 1, // Content Type => 'cty'
                            title: params.get(NFBR.a5q.Key.CONTENT_TITLE), // Content Title => 'cti'
                            winWidth: 3840,
                            winHeight: 2160
                        }).done(meta => {
                            (async function(){
                                try {
                                    const url = meta.url + 'configuration_pack.json?' + (meta.contentAppendParam || '');
                                    const response = await fetch(url);
                                    const data = await response.json();
                                    // TODO: filter 'cover' / 'copyright' / 'credit' ?
                                    const pages = data.configuration.contents.map(page => {
                                        let mode = 'raw';
                                        let file = page.file + '/0';
                                        for (let d = v = 0; d < file.length; d++) {
                                            v += file.charCodeAt(d);
                                        }
                                        if(data.ct && data.et && data.st) {
                                            mode = 'RC4+puzzle';
                                            file += '.dat?';
                                            /* May also use low quality mobile images instead of RC4 encrypted images ...
                                            mode = 'puzzle';
                                            file = 'mobile/' + file + '.jpeg?';
                                            */
                                        } else {
                                            // TODO: find more reliable way to distinguish between 'raw' and 'puzzle' mode
                                            mode = meta.url.includes('bookwalker.jp') ? 'raw' : 'puzzle';
                                            file += '.jpeg?';
                                        }
                                        return {
                                            mode: mode,
                                            imageUrl: meta.url + file + (meta.contentAppendParam || ''),
                                            encryption: {
                                                pattern: v % NFBR.a0X.a3h + 1,
                                                key: {
                                                    ct: data.ct,
                                                    et: data.et,
                                                    st: data.st,
                                                    bs: data.bs || 128,
                                                    hs: data.hs || 1024,
                                                    useRawContent: undefined
                                                    // See also: https://github.com/h-ishioka/jumpbookstore/blob/c2e2b63083def529831632fe7b6f623152d29670/src/jumpbookstore/extract.py#L21-L26
                                                }
                                            }
                                        };
                                    });
                                    resolve(pages);
                                } catch(error) {
                                    reject(error);
                                }
                            })();
                        }).fail(error => {
                            reject(error);
                        });
                    } catch(error) {
                        reject(error);
                    }
                }, ${this.config.scrapeDelay.value});
            });
        `;
        const uri = new URL( chapter.id, this.url );
        const request = new Request( uri.href, this.requestOptions );
        const data = await Engine.Request.fetchUI(request, script);
        return data.map(page => page.mode === 'raw' ? page.imageUrl : this.createConnectorURI(page));
    }

    async _handleConnectorURI(payload) {
        const uri = new URL(payload.imageUrl, this.url);
        const request = new Request(uri, this.requestOptions);
        const response = await fetch(request);
        switch (payload.mode) {
            case 'RC4+puzzle': {
                let data = await response.text();
                data = this._decryptRC4(data, uri.pathname.split('/').pop(), payload.encryption.key);
                data = await this._descrambleImage(data, payload.encryption.pattern);
                return this._blobToBuffer(data);
            }
            case 'puzzle': {
                let data = await response.blob();
                data = await this._descrambleImage(data, payload.encryption.pattern);
                return this._blobToBuffer(data);
            }
            case 'xor': {
                let data = await response.arrayBuffer();
                data = {
                    mimeType: response.headers.get('content-type'),
                    data: await this._decryptXOR(data, payload.encryption.key)
                };
                this._applyRealMime(data);
                return data;
            }
            default: {
                let data = await response.blob();
                return this._blobToBuffer(data);
            }
        }
    }

    _decryptRC4(plain, file, key) {
        const bytes = atob(plain).split('').map(c => c.charCodeAt(0));
        // create chunks of size 49152
        const chunks = [];
        while(bytes.length > 0) {
            chunks.push(bytes.splice(0, 49152));
        }
        const decrypted = NFBR.a5QLoader.dea0q_(chunks, key.ct + key.st + file, key.ct + file + key.et, file + key.st + key.et, key.bs, key.hs);
        return new Blob(decrypted.map(chunk => new Uint8Array(chunk)), { type: 'image/jpeg' });
    }

    _decryptXOR(encrypted, key) {
        if (key) {
            let t = new Uint8Array(key.match(/.{1,2}/g).map(e => parseInt(e, 16)));
            let s = new Uint8Array(encrypted);
            for (let n = 0; n < s.length; n++) {
                s[n] ^= t[n % t.length];
            }
            return s;
        } else {
            return encrypted;
        }
    }

    async _descrambleImage(scrambled, key) {
        let bitmap = await createImageBitmap(scrambled);
        return new Promise(resolve => {
            let canvas = document.createElement('canvas');
            canvas.width = bitmap.width;
            canvas.height = bitmap.height;
            var ctx = canvas.getContext('2d');
            let blocks = NFBR.a3E.a3f(bitmap.width, bitmap.height, NFBR.a0X.a3g, NFBR.a0X.a3G, key);
            for (let q of blocks) {
                /*if(q.srcX < l.x + l.width && q.srcX + q.width >= l.x && q.srcY < l.y + l.height && q.srcY + q.height >= l.y)*/
                ctx.drawImage(bitmap, q.destX, q.destY, q.width, q.height, q.srcX, q.srcY, q.width, q.height);
            }
            canvas.toBlob(data => {
                resolve(data);
            }, Engine.Settings.recompressionFormat.value, parseFloat(Engine.Settings.recompressionQuality.value)/100);
        } );
    }
}

/**
 *************************
 *** PUBLUS CODE BEGIN ***
 *************************
 */

const NFBR = {
    a0b: {
        a0F: function(a) {
            var b, c, d, e = [], f = [];
            for (b = 0; b < 256; b++)
                e[b] = b;
            for (b = 0; b < 256; b++)
                f[b] = a.charCodeAt(b % a.length);
            for (c = 0,
            b = 0; b < 256; b++)
                c = (c + e[b] + f[b]) % 256,
                d = e[b],
                e[b] = e[c],
                e[c] = d;
            return e;
        },
        a0g: function(a, b) {
            var c, d, e, f, g = [], h = [];
            h.length = a.length,
            g = this.a0F(b),
            c = 0,
            d = 0;
            for (var i = a.length, j = 0; j < i; j++)
                c = (c + 1) % 256,
                d = (d + g[c]) % 256,
                f = g[c],
                g[c] = g[d],
                g[d] = f,
                e = (g[c] + g[d]) % 256,
                h[j] = a[j] ^ g[e];
            return h;
        },
        a0G: function(a, b) {
            return NFBR.a0b.a0g(a, b);
        }
    },
    a0A: {
        a0f: function(b, c, d) {
            var e = [];
            "undefined" == typeof d && (d = 0),
            e = NFBR.a0b.a0F(b);
            for (var f = 0; f < c.length; f++)
                c[f] = c[f] ^ e[(f + d) % 256];
            return c;
        },
        a0e: function(b, c, d) {
            var e = c
                , f = []
                , g = []
                , h = 0
                , i = d;
            for (i > e.length && (i = e.length),
            f.length = i,
            g.length = i,
            h = 0; h < i; h++)
                f[h] = c[h];
            for (g = NFBR.a0b.a0G(f, b),
            h = 0; h < i; h++)
                c[h] = g[h];
        }
    },
    a5QLoader: {
        dea0q_: function(a, b, c, d, e, f) {
            var h, i, j, k, l;//, m = $.Deferred(), n = new NFBR.a0b;
            for (h = 0,
            i = 0; i < a.length; i++)
                NFBR.a0A.a0f(d, a[i], h),
                h += a[i].length;
            for (k = new Array(Math.ceil(length / e)),
            l = new Array(Math.ceil(length / e)),
            h = 0,
            j = 0,
            i = 0; i < a.length; i++) {
                for (; h < a[i].length; h += e)
                    k[j] = a[i][h],
                    j += 1;
                h -= a[i].length;
            }
            for (l = NFBR.a0b.a0G(k, c),
            h = 0,
            j = 0,
            i = 0; i < a.length; i++) {
                for (; h < a[i].length; h += e)
                    a[i][h] = l[j],
                    j += 1;
                h -= a[i].length;
            }
            return NFBR.a0A.a0e(b, a[0], f),
            //m.resolve(a),
            //m.promise()
            a;
        }
    },
    a0X: {
        a3g: 64,
        a3G: 64
    },
    a3E: {
        /**
         * a => image width
         * b => image height
         * f => scramble block width
         * g => scramble block height
         * h => pattern
         */
        a3f: function(a, b, f, g, h) {
            var i, n, o, p, q, r, s, t, u, v, w, x, y = Math.floor(a / f), z = Math.floor(b / g), A = a % f, B = b % g, C = [];
            if (i = y - 43 * h % y,
            i = i % y == 0 ? (y - 4) % y : i,
            i = 0 == i ? y - 1 : i,
            n = z - 47 * h % z,
            n = n % z == 0 ? (z - 4) % z : n,
            n = 0 == n ? z - 1 : n,
            A > 0 && B > 0 && (o = i * f,
            p = n * g,
            C.push({
                srcX: o,
                srcY: p,
                destX: o,
                destY: p,
                width: A,
                height: B
            })),
            B > 0)
                for (s = 0; s < y; s++)
                    u = NFBR.a3E.calcXCoordinateXRest_(s, y, h),
                    v = NFBR.a3E.calcYCoordinateXRest_(u, i, n, z, h),
                    q = NFBR.a3E.calcPositionWithRest_(u, i, A, f),
                    r = v * g,
                    o = NFBR.a3E.calcPositionWithRest_(s, i, A, f),
                    p = n * g,
                    C.push({
                        srcX: o,
                        srcY: p,
                        destX: q,
                        destY: r,
                        width: f,
                        height: B
                    });
            if (A > 0)
                for (t = 0; t < z; t++)
                    v = NFBR.a3E.calcYCoordinateYRest_(t, z, h),
                    u = NFBR.a3E.calcXCoordinateYRest_(v, i, n, y, h),
                    q = u * f,
                    r = NFBR.a3E.calcPositionWithRest_(v, n, B, g),
                    o = i * f,
                    p = NFBR.a3E.calcPositionWithRest_(t, n, B, g),
                    C.push({
                        srcX: o,
                        srcY: p,
                        destX: q,
                        destY: r,
                        width: A,
                        height: g
                    });
            for (s = 0; s < y; s++)
                for (t = 0; t < z; t++)
                    u = (s + h * 29 + 31 * t) % y,
                    v = (t + h * 37 + 41 * u) % z,
                    w = u >= NFBR.a3E.calcXCoordinateYRest_(v, i, n, y, h) ? A : 0,
                    x = v >= NFBR.a3E.calcYCoordinateXRest_(u, i, n, z, h) ? B : 0,
                    q = u * f + w,
                    r = v * g + x,
                    o = s * f + (s >= i ? A : 0),
                    p = t * g + (t >= n ? B : 0),
                    C.push({
                        srcX: o,
                        srcY: p,
                        destX: q,
                        destY: r,
                        width: f,
                        height: g
                    });
            return C;
        },
        calcPositionWithRest_: function(a, b, c, d) {
            return a * d + (a >= b ? c : 0);
        },
        calcXCoordinateXRest_: function(b, c, d) {
            var e = (b + 61 * d) % c;
            return e;
        },
        calcYCoordinateXRest_: function(a, b, c, d, e) {
            var /*h, */i, j, k, l = e % 2 === 1;
            return k = a < b ? l : !l,
            k ? (j = c,
            i = 0) : (j = d - c,
            i = c),
            /*h = */(a + e * 53 + c * 59) % j + i;
        },
        calcXCoordinateYRest_: function(a, b, c, d, e) {
            var /*f, */g, j, k, l = e % 2 == 1;
            return k = a < c ? l : !l,
            k ? (j = d - b,
            g = b) : (j = b,
            g = 0),
            /*f = */(a + e * 67 + b + 71) % j + g;
        },
        calcYCoordinateYRest_: function(a, c, d) {
            var e = (a + 73 * d) % c;
            return e;
        }
    }
};

/**
 ***********************
 *** PUBLUS CODE END ***
 ***********************
 */