import Connector from '../engine/Connector.mjs';
import Manga from '../engine/Manga.mjs';

export default class Piccoma extends Connector {

    constructor() {
        super();
        super.id = 'piccoma';
        super.label = 'Piccoma';
        this.tags = ['webtoon', 'japanese'];
        this.url = 'https://piccoma.com/web';
    }

    async _getMangaFromURI(uri) {
        const id = uri.pathname.split('/')[3];
        const request = new Request(uri.href);
        const [data] = await this.fetchDOM(request, '.PCM-productTitle');
        const title = data.textContent.trim();
        return new Manga(this, id, title);
    }

    async _getMangas() {
        const mangas = [];
        let totalPage = 1;
        for (let i = 1; i <= totalPage; i++) {
            const request = new Request(`${this.url}/next_page/list?result_id=2&list_type=C&sort_type=N&page_id=${i}`, this.requestOptions);
            const res = await this.fetchJSON(request);
            totalPage = res.data.total_page;
            const products = res.data.products;
            mangas.push(...products.map(({ id, title }) => {
                return { id, title };
            }));
        }
        return mangas;
    }

    async _getChapters(manga) {
        const request = new Request(`${this.url}/product/${manga.id}/episodes?etype=E`);
        const data = await this.fetchDOM(request, '.PCM-product_episodeList > a');
        return data.map(element => {
            return {
                id: `${manga.id}/${element.dataset.episode_id}`,
                title: element.querySelector('.PCM-epList_title').textContent.trim(),
            };
        });
    }

    async _getPages(chapter) {
        const request = new Request(`${this.url}/viewer/${chapter.id}`);
        const pdata = await Engine.Request.fetchUI(request, 'window._pdata_ || {}');
        const images = pdata.img;
        if (images == null) {
            throw new Error(`The chapter '${chapter.title}' is neither public, nor purchased!`);
        }
        return images
            .filter(img => !!img.path)
            .map(img => {
                const link = img.path.startsWith('http') ? img.path : `https:${img.path}`;
                return this.createConnectorURI({
                    url: link,
                    key: this._getSeed(link),
                    pdata
                });
            });
    }

    async _handleConnectorURI(payload) {
        const image = await this._loadImage(payload.url);
        const canvas = this._unscramble(payload.pdata, image, 50, payload.key);
        const blob = await this._canvasToBlob(canvas);
        return this._blobToBuffer(blob);
    }

    async _canvasToBlob(canvas) {
        return new Promise(resolve => {
            canvas.toBlob(data => {
                resolve(data);
            }, Engine.Settings.recompressionFormat.value, parseFloat(Engine.Settings.recompressionQuality.value) / 100);
        });
    }

    _getSeed(url) {
        const checksum = url.split('/').slice(-2)[0];
        const expires = new URL(url).searchParams.get('expires');
        const total = expires.split('').reduce((total, num2) => total + parseInt(num2), 0);
        const ch = total % checksum.length;
        return checksum.slice(ch * -1) + checksum.slice(0, ch * -1);
    }

    _loadImage(url) {
        return new Promise((resolve, reject) => {
            const image = new Image();
            image.onload = () => resolve(image);
            image.onerror = error => reject(error);
            image.src = url;
        });
    }

    // Copied from Piccoma
    _unscramble(pdata, image, num, seed) {
        var global_n, global_r, global_e;
        3 !== parseInt(pdata.category) || "P" !== pdata.scroll && "R" !== pdata.scroll ? (global_n = 0,
        global_r = 0,
        global_e = .01) : (global_n = 30,
        global_r = 30,
        global_e = 0);

        var c = Math.ceil(image.width / num) * Math.ceil(image.height / num)
            , f = [];
        for (y = 0; y < c; y++)
            f.push(y);
        var a = document.createElement("canvas")
            , s = a.getContext("2d");
        a.width = image.width,
        a.height = image.height + global_n + global_r;
        if (!pdata.isScrambled) {
            s.drawImage(image, 0, 0, image.width, image.height, 0, 0, image.width, image.height);
            return a;
        }
        var l = Math.ceil(image.width / num)
            , h = (image.height,
            function (t) {
                var n = {};
                return n.slices = t.length,
                n.cols = function (t) {
                    if (1 == t.length)
                        return 1;
                    for (var n = "init", r = 0; r < t.length; r++)
                        if ("init" == n && (n = t[r].y),
                        n != t[r].y)
                            return r;
                    return r;
                }(t),
                n.rows = t.length / n.cols,
                n.width = t[0].width * n.cols,
                n.height = t[0].height * n.rows,
                n.x = t[0].x,
                n.y = t[0].y,
                n;
            }
            )
            , p = function () {
                var n, r = {};
                for (n = 0; n < c; n++) {
                    var e = {}
                        , i = Math.floor(n / l)
                        , u = n - i * l;
                    e.x = u * num,
                    e.y = i * num,
                    e.width = num - (e.x + num <= image.width ? 0 : e.x + num - image.width),
                    e.height = num - (e.y + num <= image.height ? 0 : e.y + num - image.height),
                    r[e.width + "-" + e.height] || (r[e.width + "-" + e.height] = []),
                    r[e.width + "-" + e.height].push(e);
                }
                return r;
            }();
        for (var v in p) {
            var y, d = h(p[v]), g = [];
            for (y = 0; y < p[v].length; y++)
                g.push(y);
            for (g = _shuffleSeed_(g, seed),
            y = 0; y < p[v].length; y++) {
                var b = g[y]
                    , m = Math.floor(b / d.cols)
                    , x = (b - m * d.cols) * p[v][y].width
                    , S = m * p[v][y].height;
                s.drawImage(image, d.x + x, d.y + S, p[v][y].width, p[v][y].height + global_e, p[v][y].x, p[v][y].y + global_n, p[v][y].width, p[v][y].height);
            }
        }
        return a;
    }
}

// from https://github.com/webcaetano/shuffle-seed
function _shuffleSeed_(arr, seed) {
    const size = arr.length;
    const rng = _seedrandom_(seed);
    const resp = [];
    const keys = [];
    for (let i = 0; i < size; i++) keys.push(i);
    for (let i = 0; i < size; i++) {
        const r = Math.floor(rng() * keys.length);
        const g = keys[r];
        keys.splice(r, 1);
        resp.push(arr[g]);
    }
    return resp;
}

// from https://github.com/davidbau/seedrandom
var width = 256,
    chunks = 6,
    digits = 52,
    startdenom = Math.pow(width, chunks),
    significance = Math.pow(2, digits),
    overflow = significance * 2,
    mask = width - 1;

function _seedrandom_(seed) {
    var key = [];
    mixkey(seed, key);
    var arc4 = new ARC4(key);
    var prng = function () {
        var n = arc4.g(chunks),
            d = startdenom,
            x = 0;
        while (n < significance) {
            n = (n + x) * width;
            d *= width;
            x = arc4.g(1);
        }
        while (n >= overflow) {
            n /= 2;
            d /= 2;
            x >>>= 1;
        }
        return (n + x) / d;
    };
    return prng;
}

function ARC4(key) {
    var t, keylen = key.length,
        me = this, i = 0, j = me.i = me.j = 0, s = me.S = [];

    if (!keylen) {
        key = [keylen++];
    }

    while (i < width) {
        s[i] = i++;
    }
    for (i = 0; i < width; i++) {
        s[i] = s[j = mask & j + key[i % keylen] + (t = s[i])];
        s[j] = t;
    }

    (me.g = function (count) {
        var t, r = 0,
            i = me.i, j = me.j, s = me.S;
        while (count--) {
            t = s[i = mask & i + 1];
            r = r * width + s[mask & (s[i] = s[j = mask & j + t]) + (s[j] = t)];
        }
        me.i = i; me.j = j;
        return r;
    })(width);
}

function mixkey(seed, key) {
    var stringseed = seed + '', smear, j = 0;
    while (j < stringseed.length) {
        key[mask & j] =
            mask & (smear ^= key[mask & j] * 19) + stringseed.charCodeAt(j++);
    }
    return String.fromCharCode.apply(0, key);
}