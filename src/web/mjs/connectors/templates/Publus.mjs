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
                                        if(meta.lpInfoParam && meta.lpInfoParam.key) {
                                            //mode = 'rc4-puzzle';
                                            //file += '.dat?';
                                            // use mobile images right now, until image decryption is ready ...
                                            mode = 'puzzle';
                                            file = 'mobile/' + file + '.jpeg?';
                                        } else {
                                            // TODO: find more reliable way to distinguish between 'raw' and 'puzzle' mode
                                            mode = meta.url.includes('bookwalker.jp') ? 'raw' : 'puzzle';
                                            file += '.jpeg?';
                                        }
                                        return {
                                            // TODO: when meta.lpInfoParam.key exist
                                            // mode => use 'rc4-puzzle'
                                            // extension => use '.dat' instead of '.jpeg'
                                            mode: mode,
                                            imageUrl: meta.url + file + (meta.contentAppendParam || ''),
                                            encryption: {
                                                pattern: v % NFBR.a0X.a3h + 1,
                                                key: null
                                                /*
                                                    // RC4 Key Creation ...
                                                    // bid + NFBR.a1k.a1b => 16 bytes
                                                    // For image decryption see: https://github.com/h-ishioka/jumpbookstore/blob/c2e2b63083def529831632fe7b6f623152d29670/src/jumpbookstore/extract.py#L48
                                                */
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
        const request = new Request(payload.imageUrl, this.requestOptions);
        const response = await fetch(request);
        switch (payload.mode) {
            /*
            case 'RC4-puzzle': {
                let data = await response.text();
                data = atob(data);
                throw new Error('Not implemented!');
            }
            */
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

    /**
     *************************
     *** PUBLUS CODE BEGIN ***
     *************************
     */

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
            let blocks = this.NFBR_a3E_a3f(bitmap.width, bitmap.height, this.NFBR_a0X_a3g, this.NFBR_a0X_a3G, key);
            for (let q of blocks) {
                /*if(q.srcX < l.x + l.width && q.srcX + q.width >= l.x && q.srcY < l.y + l.height && q.srcY + q.height >= l.y)*/
                ctx.drawImage(bitmap, q.destX, q.destY, q.width, q.height, q.srcX, q.srcY, q.width, q.height);
            }
            canvas.toBlob(data => {
                resolve(data);
            }, Engine.Settings.recompressionFormat.value, parseFloat(Engine.Settings.recompressionQuality.value)/100);
        } );
    }

    get NFBR_a0X_a3g() {
        return 64;
    }

    get NFBR_a0X_a3G() {
        return 64;
    }

    /**
     * a => image width
     * f => image height
     * b => scramble block width
     * e => scramble block height
     * d => pattern
     */
    NFBR_a3E_a3f(a, f, b, e, d) {
        var c = Math.floor(a / b)
            , h = Math.floor(f / e);
        a %= b;
        f %= e;
        var g, l, k, m, p, r, t, q, u = [];
        g = c - 43 * d % c;
        g = 0 == g % c ? (c - 4) % c : g;
        g = 0 == g ? c - 1 : g;
        l = h - 47 * d % h;
        l = 0 == l % h ? (h - 4) % h : l;
        l = 0 == l ? h - 1 : l;
        0 < a && 0 < f && (k = g * b,
        m = l * e,
        u.push({
            srcX: k,
            srcY: m,
            destX: k,
            destY: m,
            width: a,
            height: f
        }));
        if (0 < f)
            for (t = 0; t < c; t++)
                p = this.calcXCoordinateXRest_(t, c, d),
                k = this.calcYCoordinateXRest_(p, g, l, h, d),
                p = this.calcPositionWithRest_(p, g, a, b),
                r = k * e,
                k = this.calcPositionWithRest_(t, g, a, b),
                m = l * e,
                u.push({
                    srcX: k,
                    srcY: m,
                    destX: p,
                    destY: r,
                    width: b,
                    height: f
                });
        if (0 < a)
            for (q = 0; q < h; q++)
                k = this.calcYCoordinateYRest_(q, h, d),
                p = this.calcXCoordinateYRest_(k, g, l, c, d),
                p *= b,
                r = this.calcPositionWithRest_(k, l, f, e),
                k = g * b,
                m = this.calcPositionWithRest_(q, l, f, e),
                u.push({
                    srcX: k,
                    srcY: m,
                    destX: p,
                    destY: r,
                    width: a,
                    height: e
                });
        for (t = 0; t < c; t++)
            for (q = 0; q < h; q++)
                p = (t + 29 * d + 31 * q) % c,
                k = (q + 37 * d + 41 * p) % h,
                r = p >= this.calcXCoordinateYRest_(k, g, l, c, d) ? a : 0,
                m = k >= this.calcYCoordinateXRest_(p, g, l, h, d) ? f : 0,
                p = p * b + r,
                r = k * e + m,
                k = t * b + (t >= g ? a : 0),
                m = q * e + (q >= l ? f : 0),
                u.push({
                    srcX: k,
                    srcY: m,
                    destX: p,
                    destY: r,
                    width: b,
                    height: e
                });
        return u;
    }

    calcPositionWithRest_(a, f, b, e) {
        return a * e + (a >= f ? b : 0);
    }

    calcXCoordinateXRest_(a, f, b) {
        return (a + 61 * b) % f;
    }

    calcYCoordinateXRest_(a, f, b, e, d) {
        var c = 1 === d % 2;
        (a < f ? c : !c) ? (e = b,
        f = 0) : (e -= b,
        f = b);
        return (a + 53 * d + 59 * b) % e + f;
    }

    calcXCoordinateYRest_(a, f, b, e, d) {
        var c = 1 == d % 2;
        (a < b ? c : !c) ? (e -= f,
        b = f) : (e = f,
        b = 0);
        return (a + 67 * d + f + 71) % e + b;
    }

    calcYCoordinateYRest_(a, f, b) {
        return (a + 73 * b) % f;
    }

    /**
     ***********************
     *** PUBLUS CODE END ***
     ***********************
     */
}