import Connector from '../engine/Connector.mjs';
import Manga from '../engine/Manga.mjs';

export default class LineMangaJP extends Connector {

    constructor() {
        super();
        super.id = 'line_manga_jp';
        super.label = 'Line Manga (LINEマンガ)';
        this.tags = ['webtoon', 'japanese'];
        this.url = 'https://manga.line.me';
    }

    async _getMangaFromURI(uri) {
        const id = uri.searchParams.get('id');
        const request = new Request(uri, this.requestOptions);
        const data = await this.fetchDOM(request, 'h1');
        const title = data[1].textContent.trim();
        return new Manga(this, id, title);
    }

    async _getMangas() {
        let hasNext = true;
        let page = 1;
        let mangas = [];
        while (hasNext) {
            const request = new Request(`${this.url}/api/search_product/magazine_list?magazine_id=Z0000001&is_periodic=0&is_original=0&page=${page}`, this.requestOptions);
            const response = await this.fetchJSON(request);
            mangas.push(...response.result.rows);
            hasNext = response.result.pager.hasNext;
            page += 1;
        }
        return mangas.map(row => {
            return {
                id: row.id,
                title: row.name
            };
        });
    }

    async _getChapters(manga) {
        const res = await this.fetchJSON(`${this.url}/api/book/product_list?need_read_info=1&rows=1000&is_periodic=1&product_id=${manga.id}`);
        const rows = res.result.rows;
        return rows.map(row => {
            return {
                id: row.id,
                title: row.name
            };
        });
    }

    async _getPages(chapter) {
        const request = new Request(`${this.url}/book/viewer?id=${chapter.id}`, this.requestOptions);
        const [images, option] = await Engine.Request.fetchUI(request, '[Object.values(window.imgs || {}), window.OPTION || {}]');
        if (option.mediado_token) {
            const mediadoData = await this._getMediadoData(option);
            return mediadoData.images.map(imageData => {
                const metaData = mediadoData.metaDataList[imageData.pageNum - 1];
                return this.createConnectorURI({
                    imageData,
                    metaData,
                });
            });
        }
        if (option.isPortal) {
            return Object.values(option.portalPages)
                .map(portalPage => this.createConnectorURI({ portalPage }));
        }
        if (images.length == 0) {
            throw new Error(`The chapter '${chapter.title}' is neither public, nor purchased!`);
        }
        return images
            .map(image => image.url)
            .filter(url => !url.includes('inline_ads_banner'));
    }

    async _handleConnectorURI(payload) {
        if (payload.portalPage != null) {
            const canvas = await this._descramblePortalPage(payload.portalPage);
            const blob = await this._canvasToBlob(canvas);
            return this._blobToBuffer(blob);
        }

        const canvas = document.createElement('canvas');
        canvas.width = payload.imageData.width;
        canvas.height = payload.imageData.height;
        const imageDataUrl = await this._getImageDataUrl(payload.imageData.url);
        const imageData = {
            ...payload.imageData,
            url: imageDataUrl,
        };
        await this._unscrambleMediadoImage(imageData, payload.metaData, canvas);
        const blob = await this._canvasToBlob(canvas);
        return this._blobToBuffer(blob);
    }

    async _getImageDataUrl(url) {
        const uri = new URL(url);
        const request = new Request(uri);
        request.headers.set('x-origin', uri.origin);
        const res = await fetch(request);
        const blob = await res.blob();
        return this._blobToDataUrl(blob);
    }

    _blobToDataUrl(blob) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.onerror = error => reject(error);
            reader.readAsDataURL(blob);
        });
    }

    _canvasToBlob(canvas) {
        return new Promise(resolve => {
            canvas.toBlob(data => {
                resolve(data);
            }, Engine.Settings.recompressionFormat.value, parseFloat(Engine.Settings.recompressionQuality.value) / 100);
        });
    }

    // Copied from Line Manga
    async _getMediadoData(option) {
        const contentUrl = option.mediado_contents_url;
        const contentFile = option.mediado_contents_file;
        const token = option.mediado_token;
        const mediadoUrl = `${contentUrl}${contentFile}?token=${token}`;
        NFBR.a8O.a8M();
        const res = await fetch(mediadoUrl, {
            headers: {
                "Content-Type": "application/json",
                "X-Requested-With": "XMLHttpRequest"
            }
        });
        const mediadoData = await res.json();
        const { configuration } = mediadoData;
        const pages = configuration.contents.map((item) => {
            return {
                data: mediadoData[item.file].FileLinkInfo.PageLinkInfoList[0].Page,
                file: item.file,
                index: item.index,
                dummyImg: item.dummyImg
            };
        });
        const images = pages.map((page) => {
            return {
                pageNum: page.index,
                url: `${contentUrl}${page.file}/0.jpeg?token=${token}`,
                height: page.data.Size.Height + page.data.DummyHeight,
                width: page.data.Size.Width + page.data.DummyWidth,
            };
        });
        const metaDataList = pages.map((page) => {
            return {
                ...page.data,
                imageFilePath: `${page.file}/0.jpeg`,
                side: mediadoData[page.file].FixedLayoutSpec.PageSide
            };
        });
        return {
            images,
            metaDataList,
        };
    }

    _drawImage(canvas, image, metaData) {
        const { DummyWidth, DummyHeight, imageFilePath } = metaData;
        const offset = metaData.Size.Height - metaData.Rect.Height;
        return NFBR.a8O.a8p(
            canvas,
            image,
            DummyWidth,
            DummyHeight + offset,
            imageFilePath
        );
    }

    async _unscrambleMediadoImage(imageData, metaData, canvas) {
        return new Promise((resolve, reject) => {
            const image = new Image();
            image.onload = async () => {
                this._drawImage(canvas, image, metaData);
                resolve();
            };
            image.onerror = (err) => {
                reject(err);
            };
            image.src = imageData.url;
        });
    }

    async _descramblePortalPage(portalPage) {
        const uri = new URL(portalPage.url);
        const request = new Request(uri);
        request.headers.set('x-origin', uri.origin);
        const res = await fetch(request);
        const blob = await res.blob();
        const image = await createImageBitmap(blob);
        const canvas = document.createElement('canvas');
        canvas.width = image.width;
        canvas.height = image.height;
        const context = canvas.getContext('2d');
        context.drawImage(image, 0, 0);
        for (let i = 0; i < portalPage.metadata.m.length; i++) {
            const data = portalPage.metadata.m[i];
            const o = parseInt(data, 35);
            const c = o % portalPage.metadata.hc * portalPage.metadata.bwd;
            const s = Math.floor(o / portalPage.metadata.hc) * portalPage.metadata.bwd;
            const l = i % portalPage.metadata.hc * portalPage.metadata.bwd;
            const u = Math.floor(i / portalPage.metadata.hc) * portalPage.metadata.bwd;
            context.drawImage(image, c, s, portalPage.metadata.bwd, portalPage.metadata.bwd, l, u, portalPage.metadata.bwd, portalPage.metadata.bwd);
        }
        return canvas;
    }
}

/**
 * Publus
 */
const NFBR = {
    CANVAS_DUMMY1: null,
    CANVAS_DUMMY2: null,
    a8O: {
        a8M: function () {
            NFBR.CANVAS_DUMMY1 = document.createElement('canvas');
            NFBR.CANVAS_DUMMY2 = document.createElement('canvas');
        },
        a8p: function (t, i, e, a, h, n) {
            var r = {
                x: 0,
                y: 0,
                width: t.width,
                height: t.height
            };
            var s = {
                width: i.width,
                height: i.height,
                dummyWidth: e,
                dummyHeight: a
            };
            var o = h.lastIndexOf(".");
            if (-1 !== o) {
                var l = h.slice(0, o);
                s.pattern = 0;
                for (var c = 0; c < l.length; c++)
                    s.pattern += l.charCodeAt(c);
                s.pattern = s.pattern % NFBR.a0X.a3h + 1;
                return NFBR.a6G.a5x.a8H(t, s, i, r, n);
            }
        }
    },

    a6G: {
        a5x: {
            Alignment: {
                LEFT: 0,
                RIGHT: 1,
                CENTER: 2
            },
            a8H: function (t, i, e, a, h) {
                var n, r = {}, s = null;
                if (this.clearRect(t, a),
                i.height * a.width > a.height * i.width)
                    switch (r.y = a.y,
                    r.width = Math.round(i.width * a.height / i.height),
                    r.height = a.height,
                    n = !1,
                    h) {
                        case NFBR.a6G.a5x.Alignment.LEFT:
                            r.x = a.x;
                            break;
                        case NFBR.a6G.a5x.Alignment.RIGHT:
                            r.x = a.x + a.width - r.width;
                            break;
                        default:
                            r.x = Math.floor(a.x + .5 * (a.width - r.width));
                    }
                else
                    r.x = a.x,
                    r.width = a.width,
                    r.height = Math.round(i.height * a.width / i.width),
                    r.y = Math.floor(a.y + .5 * (a.height - r.height)),
                    n = !0;
                var o, l, c, d = NFBR.CANVAS_DUMMY1, g = d.getContext("2d"), u = t.getContext("2d");
                if (e) {
                    if (NFBR.a0X.a3F && !1 === this.a6t(i.dummyWidth) && !1 === this.a6t(i.dummyHeight)) {
                        s = {
                            x: -r.x / r.width * e.width,
                            y: -r.y / r.height * e.height,
                            width: t.width / r.width * e.width,
                            height: t.height / r.height * e.height
                        },
                        d.width !== e.width && (d.width = e.width),
                        d.height !== e.height && (d.height = e.height),
                        o = NFBR.a3E.a3f(e.width, e.height, NFBR.a0X.a3g, NFBR.a0X.a3G, i.pattern);
                        for (c = 0; c < o.length; c++)
                            (l = o[c]).a6T < s.x + s.width && l.a6T + l.width >= s.x && l.a6u < s.y + s.height && l.a6u + l.height >= s.y && g.drawImage(e, l.a6U, l.a6v, l.width, l.height, l.a6T, l.a6u, l.width, l.height);
                        var v = e.width
                            , p = e.height
                            , R = v - i.dummyWidth
                            , S = p - i.dummyHeight;
                        this.a8i(u, d, n, R, S, a.width, a.height, {
                            x: 0,
                            y: 0,
                            width: R,
                            height: S
                        }, r),
                        g.clearRect(0, 0, d.width, d.height);
                    } else {
                        R = e.width,
                        S = e.height;
                        this.a8i(u, e, n, R, S, a.width, a.height, {
                            x: 0,
                            y: 0,
                            width: R,
                            height: S
                        }, r);
                    }
                } else
                    u.save(),
                    u.fillStyle = "white",
                    u.fillRect(r.x, r.y, r.width, r.height),
                    u.restore();
                return r;
            },
            a8i: function (t, i, e, a, h, n, r, s, o) {
                var l;
                l = e ? 0 === n ? 0 : a / n : 0 === r ? 0 : h / r;
                var c = Math.floor(l / 2);
                if (c < 1)
                    t.drawImage(i, s.x, s.y, s.width, s.height, o.x, o.y, o.width, o.height);
                else {
                    var d = NFBR.CANVAS_DUMMY2;
                    d.width = Math.ceil(a / 2),
                    d.height = Math.ceil(h / 2);
                    var g = d.getContext("2d")
                        , u = 2;
                    for (g.drawImage(i, 0, 0, a, h, 0, 0, Math.ceil(a / u), Math.ceil(h / u)),
                    u = 4; u / 2 <= c; u += 2)
                        g.drawImage(d, 0, 0, Math.ceil(a / (u - 2)), Math.ceil(h / (u - 2)), 0, 0, Math.ceil(a / u), Math.ceil(h / u));
                    u -= 2,
                    t.drawImage(d, 0, 0, a / u, h / u, o.x, o.y, o.width, o.height),
                    g.clearRect(0, 0, d.width, d.height);
                }
            },
            a6t: function (t) {
                return void 0 === t;
            },
            clearRect: function (t, i) {
                var e = t.getContext("2d");
                e.fillStyle = NFBR.a0X.a3n,
                e.fillRect(i.x, i.y, i.width, i.height);
            },
        }
    },

    a0X: {
        a3F: !0,
        a3g: 64,
        a3G: 64,
        a3h: 4,
        a3n: "#3b3b3b",
    },

    a3E: {
        a3f: function (t, i, e, a, h) {
            var n, r, s, o, l, c, d, g, u, f, w = Math.floor(t / e), v = Math.floor(i / a), p = t % e, R = i % a, S = [];
            if (n = 0 == (n = (n = w - 43 * h % w) % w == 0 ? (w - 4) % w : n) ? w - 1 : n,
            r = 0 == (r = (r = v - 47 * h % v) % v == 0 ? (v - 4) % v : r) ? v - 1 : r,
            p > 0 && R > 0 && (s = n * e,
            o = r * a,
            S.push({
                a6T: s,
                a6u: o,
                a6U: s,
                a6v: o,
                width: p,
                height: R
            })),
            R > 0)
                for (d = 0; d < w; d++)
                    u = this.a6r(d, w, h),
                    f = this.a6R(u, n, r, v, h),
                    l = this.a6Q(u, n, p, e),
                    c = f * a,
                    s = this.a6Q(d, n, p, e),
                    o = r * a,
                    S.push({
                        a6T: s,
                        a6u: o,
                        a6U: l,
                        a6v: c,
                        width: e,
                        height: R
                    });
            if (p > 0)
                for (g = 0; g < v; g++)
                    f = this.a6S(g, v, h),
                    l = (u = this.a6s(f, n, r, w, h)) * e,
                    c = this.a6Q(f, r, R, a),
                    s = n * e,
                    o = this.a6Q(g, r, R, a),
                    S.push({
                        a6T: s,
                        a6u: o,
                        a6U: l,
                        a6v: c,
                        width: p,
                        height: a
                    });
            for (d = 0; d < w; d++)
                for (g = 0; g < v; g++)
                    f = (g + 37 * h + 41 * (u = (d + 29 * h + 31 * g) % w)) % v,
                    l = u * e + (u >= this.a6s(f, n, r, w, h) ? p : 0),
                    c = f * a + (f >= this.a6R(u, n, r, v, h) ? R : 0),
                    s = d * e + (d >= n ? p : 0),
                    o = g * a + (g >= r ? R : 0),
                    S.push({
                        a6T: s,
                        a6u: o,
                        a6U: l,
                        a6v: c,
                        width: e,
                        height: a
                    });
            return S;
        },
        a6Q: function (t, i, e, a) {
            return t * a + (t >= i ? e : 0);
        },
        a6r: function (t, i, e) {
            return (t + 61 * e) % i;
        },
        a6R: function (t, i, e, a, h) {
            var n, r, s = h % 2 === 1;
            return (t < i ? s : !s) ? (r = e,
            n = 0) : (r = a - e,
            n = e),
            (t + 53 * h + 59 * e) % r + n;
        },
        a6s: function (t, i, e, a, h) {
            var n, r, s = h % 2 == 1;
            return (t < e ? s : !s) ? (r = a - i,
            n = i) : (r = i,
            n = 0),
            (t + 67 * h + i + 71) % r + n;
        },
        a6S: function (t, i, e) {
            return (t + 73 * e) % i;
        }
    },
};