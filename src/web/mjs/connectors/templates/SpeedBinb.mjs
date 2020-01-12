import Connector from '../../engine/Connector.mjs';

export default class SpeedBinb extends Connector {

    constructor() {
        super();
        super.id = undefined;
        super.label = undefined;
        this.tags = [];
        this.url = undefined;
    }

    /**
     *
     */
    _getPageList( manga, chapter, callback ) {
        let request = new Request( this.getAbsolutePath( chapter.id, this.url ), this.requestOptions );
        this.fetchDOM( request, 'div#content.pages' )
            .then( data => {
                data = data[0];
                if( data.dataset['ptbinb'] && data.dataset['ptbinbCid'] )
                {
                    return this._getPageList_v016113( chapter.id + '&cid=' + data.dataset['ptbinbCid'], data.dataset.ptbinb );
                }
                if( data.dataset['ptbinb'] && data.dataset.ptbinb.includes( 'bibGetCntntInfo' ) ) {
                    return this._getPageList_v016130( chapter.id, data.dataset.ptbinb );
                }
                let imageConfigurtions = data.querySelectorAll( 'div[data-ptimg$="ptimg.json"]' );
                if( imageConfigurtions.length > 0 ) {
                    return this._getPageList_v016061( [...imageConfigurtions], request.url );
                }
                //
                throw new Error( 'Unsupported version of SpeedBinb reader!' );
            } )
            .then( pageList => callback( null, pageList ) )
            .catch( error => {
                console.error( error, chapter );
                callback( error, undefined );
            } );
    }

    /**
     *
     */
    _handleConnectorURI( payload ) {
        /*
         * TODO: only perform requests when from download manager
         * or when from browser for preview and selected chapter matches
         */
        let promise;
        switch( true ) {
            case payload.endsWith( 'ptimg.json' ):
                promise = this._process_v016061( payload );
                break;
            case payload.includes( 'sbcGetImg' ):
                promise = this._process_v016130( payload );
                break;
            case payload.includes( 'M_L.jpg' ):
                promise = this._process_v016130( payload );
                break;
            case payload.includes( 'M_H.jpg' ):
                promise = this._process_v016130( payload );
                break;
            case payload.includes( '/img/' ):
                promise = this._process_v016130( payload );
                break;
            default:
                promise = Promise.reject( 'Unsupported version of SpeedBinb reader!' );
                break;
        }
        return promise.then( data => this._blobToBuffer( data ) )
            .then( data => {
                this._applyRealMime( data );
                return Promise.resolve( data );
            } );
    }

    /**
     *************************
     *** SpeedBinb v01.6061 ***
     * ** Comic Meteor       ***
     *************************
     */

    /**
     *
     */
    _getPageList_v016061( imageConfigurtions, baseURL ) {
        let pageLinks = imageConfigurtions.map( element => this.createConnectorURI( this.getAbsolutePath( element.dataset.ptimg, baseURL ) ) );
        return Promise.resolve( pageLinks );
    }

    /**
     *
     */
    _process_v016061( ptimgConfigURL ) {
        let views;
        return fetch( ptimgConfigURL, this.requestOptions )
            .then( response => response.json() )
            .then( data => {
                let href = new URL( data.resources.i.src, ptimgConfigURL ).href;
                views = data.views;
                return fetch( href, this.requestOptions );
            } )
            .then( response => response.blob() )
            .then( data => createImageBitmap( data ) )
            .then( bitmap => this._descramble_v016061( bitmap, views ) );
    }

    /**
     *
     */
    _descramble_v016061( bitmap, views ) {
        return new Promise( resolve => {
            let view = views[0];
            let canvas = document.createElement( 'canvas' );
            canvas.width = view.width;
            canvas.height = view.height;
            let ctx = canvas.getContext( '2d' );

            for( let part of view.coords ) {
                // sample => 'i:119,4+107,150>428,900'
                let num = part.split( /[:,+>]/ );
                let sourceX = parseInt( num[1] );
                let sourceY = parseInt( num[2] );
                let targetX = parseInt( num[5] );
                let targetY = parseInt( num[6] );
                let partWidth = parseInt( num[3] );
                let partHeight = parseInt( num[4] );
                ctx.drawImage( bitmap, sourceX, sourceY, partWidth, partHeight, targetX, targetY, partWidth, partHeight );
            }
            canvas.toBlob( data => {
                resolve( data );
            }, Engine.Settings.recompressionFormat.value, parseFloat( Engine.Settings.recompressionQuality.value )/100 );
        } );
    }

    /**
     *************************
     *** SpeedBinb v01.6113 ***
     * ** Ohtabooks          ***
     *************************
     */

    // Fully compatible to v01.6130
    _getPageList_v016113( chapterID, apiURL ) {
        return this._getPageList_v016130( chapterID, apiURL );
    }

    /**
     *************************
     *** SpeedBinb v01.6130 ***
     * ** BookLive           ***
     *************************
     */

    /**
     *
     */
    _getPageList_v016130( chapterID, apiURL ) {
        let cid = new URL( chapterID, this.url ).searchParams.get( 'cid' );
        let sharingKey = this._tt( cid );
        let uri = new URL( apiURL, this.url );
        uri.searchParams.set( 'cid', cid );
        uri.searchParams.set( 'dmytime', Date.now() );
        uri.searchParams.set( 'k', sharingKey );
        let request = new Request( uri.href, this.requestOptions );
        return fetch( request )
            .then( response => response.json() )
            .then( data => {
                return this._getPageLinks_v016130( data.items[0], sharingKey );
            } );
    }

    /**
     *
     */
    _getPageLinks_v016130( configuration, sharingKey ) {
        let cid = configuration['ContentID'];
        /*
         *let stbl = this._pt( cid, sharingKey, configuration.stbl );
         *let ttbl = this._pt( cid, sharingKey, configuration.ttbl );
         */
        configuration.ctbl = this._pt( cid, sharingKey, configuration.ctbl );
        configuration.ptbl = this._pt( cid, sharingKey, configuration.ptbl );

        if( configuration['ServerType'] === 0 ) {
            return this._getPageLinksSBC_v016130( configuration );
        }
        if( configuration['ServerType'] === 1 ) {
            return this._getPageLinksContentJS_v016130( configuration );
        }
        if( configuration['ServerType'] === 2 ) {
            return this._getPageLinksContent_v016130( configuration );
        }
        return Promise.reject( new Error( 'Content server type not supported!' ) );
    }

    _getPageLinksSBC_v016130( configuration ) {
        let uri = new URL( configuration['ContentsServer'] + '/sbcGetCntnt.php' );
        uri.searchParams.set( 'cid', configuration['ContentID'] );
        uri.searchParams.set( 'dmytime', configuration['ContentDate'] );
        uri.searchParams.set( 'p', configuration['p'] );
        uri.searchParams.set( 'vm', configuration['ViewMode'] );
        return fetch( new Request( uri.href, this.requestOptions ) )
            .then( response => response.json() )
            .then( data => {
                let dom = this.createDOM( data.ttx );
                let pageLinks = [...dom.querySelectorAll( 't-case:first-of-type t-img' )].map( img => {
                    let src = img.getAttribute( 'src' );
                    uri.searchParams.set( 'src', src );
                    uri.hash = btoa( JSON.stringify( this._lt_001( src, configuration.ctbl, configuration.ptbl ) ) );
                    return this.createConnectorURI( uri.href.replace( 'sbcGetCntnt.php', 'sbcGetImg.php' ) );
                } );
                return Promise.resolve( pageLinks );
            } );
    }

    _getPageLinksContent_v016130( configuration ) {
        let uri = new URL( configuration['ContentsServer'] );
        uri.pathname += '/content';
        uri.searchParams.set( 'dmytime', configuration['ContentDate'] );
        return fetch( new Request( uri.href, this.requestOptions ) )
            .then( response => response.json() )
            .then( data => {
                let dom = this.createDOM( data.ttx );
                let pageLinks = [...dom.querySelectorAll( 't-case:first-of-type t-img' )].map( img => {
                    let src = img.getAttribute( 'src' );
                    uri.hash = btoa( JSON.stringify( this._lt_001( src, configuration.ctbl, configuration.ptbl ) ) );
                    return this.createConnectorURI( uri.href.replace( '/content', '/img/' + src ) );
                } );
                return Promise.resolve( pageLinks );
            } );
    }

    _getPageLinksContentJS_v016130( configuration ) {
        let uri = new URL( configuration['ContentsServer'] );
        uri.pathname += uri.pathname.endsWith('/') ? '' : '/';
        uri.pathname += 'content.js';
        uri.searchParams.set( 'dmytime', configuration['ContentDate'] );
        return fetch( new Request( uri.href, this.requestOptions ) )
            .then( response => response.text() )
            .then( data => JSON.parse( data.slice( 16, -1 ) ) )
            .then( data => {
                let dom = this.createDOM( data.ttx );
                let pageLinks = [...dom.querySelectorAll( 't-case:first-of-type t-img' )].map( img => {
                    let src = img.getAttribute( 'src' );
                    uri.hash = btoa( JSON.stringify( this._lt_001( src, configuration.ctbl, configuration.ptbl ) ) );
                    return this.createConnectorURI( uri.href.replace( 'content.js', src + '/M_H.jpg' ) ); // '/M_L.jpg'
                } );
                return Promise.resolve( pageLinks );
            } );
    }

    /**
     *
     */
    _process_v016130( scrambledImageURL ) {
        let uri = new URL( scrambledImageURL );
        //let request = new Request( uri.href, this.requestOptions );
        let descrambleKeyPair = JSON.parse( atob( uri.hash.slice( 1 ) ) );
        return fetch( scrambledImageURL, this.requestOptions )
            .then( response => response.blob() )
            .then( data => createImageBitmap( data ) )
            .then( bitmap => this._descramble_v016130( bitmap, descrambleKeyPair ) );
    }

    /**
     *
     */
    _descramble_v016130( bitmap, keys ) {
        return new Promise( resolve => {
            let view = this._getImageDescrambleCoords(keys.s, keys.u, bitmap.width, bitmap.height );

            let canvas = document.createElement( 'canvas' );
            canvas.width = view.width;
            canvas.height = view.height;
            let ctx = canvas.getContext( '2d' );

            for( let part of view.transfers[0].coords ) {
                let sourceX = parseInt( part.xsrc );
                let sourceY = parseInt( part.ysrc );
                let targetX = parseInt( part.xdest );
                let targetY = parseInt( part.ydest );
                let partWidth = parseInt( part.width );
                let partHeight = parseInt( part.height );
                ctx.drawImage( bitmap, sourceX, sourceY, partWidth, partHeight, targetX, targetY, partWidth, partHeight );
            }

            canvas.toBlob( data => {
                resolve( data );
            }, Engine.Settings.recompressionFormat.value, parseFloat( Engine.Settings.recompressionQuality.value )/100 );
        } );
    }

    /**
     *********************
     *** SpeedBinb Base ***
     ********************
     */

    /**
     * Copied from official SpeedBinb library
     */
    _tt(t) {
        var n = Date.now().toString(16).padStart(16,'x') // w.getRandomString(16)
            , i = Array(Math.ceil(16 / t.length) + 1).join(t)
            , r = i.substr(0, 16)
            , e = i.substr(-16, 16)
            , s = 0
            , u = 0
            , h = 0;
        return n.split("").map(function(t, i) {
            return s ^= n.charCodeAt(i),
            u ^= r.charCodeAt(i),
            h ^= e.charCodeAt(i),
            t + "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_"[s + u + h & 63];
        }).join("");
    }

    // NOTE: i = p.tt(t)
    /**
     * Copied from official SpeedBinb library
     */
    _pt(t, i, n) {
        for (var r = t + ":" + i, e = 0, s = 0; s < r.length; s++)
            e += r.charCodeAt(s) << s % 16;
        0 == (e &= 2147483647) && (e = 305419896);
        var u = ""
            , h = e;
        for (s = 0; s < n.length; s++) {
            h = h >>> 1 ^ 1210056708 & -(1 & h);
            var o = (n.charCodeAt(s) - 32 + h) % 94 + 32;
            u += String.fromCharCode(o);
        }
        try {
            return JSON.parse(u);
        // eslint-disable-next-line no-empty
        } catch (t) {}
        return null;
    }

    /**
     * Copied from official SpeedBinb library
     * t => 'pages/cu77gvXE.jpg'
     */
    _lt(t, ctbl, ptbl) {
        // determine which descramble key pair from ctbl / ptbl shall be used
        var i = [0, 0];
        if (t) {
            for (var n = t.lastIndexOf("/") + 1, r = t.length - n, e = 0; e < r; e++)
                i[e % 2] += t.charCodeAt(e + n);
            i[0] %= 8,
            i[1] %= 8;
        }
        var s = ptbl[i[0]]
            , u = ctbl[i[1]];
        // get a descrambler based on the descramble key pair
        return "=" === u.charAt(0) && "=" === s.charAt(0) ? new _speedbinb_f(u,s) : u.match(/^[0-9]/) && s.match(/^[0-9]/) ? new _speedbinb_a(u,s) : "" === u && "" === s ? new _speedbinb_h : null;
    }

    /**
     * Determine which descramble key pair from ctbl / ptbl shall be used
     * depending on the given image name => 'pages/cu77gvXE.jpg'
     */
    _lt_001(t, ctbl, ptbl) {
        var i = [0, 0];
        if (t) {
            for (var n = t.lastIndexOf("/") + 1, r = t.length - n, e = 0; e < r; e++)
                i[e % 2] += t.charCodeAt(e + n);
            i[0] %= 8,
            i[1] %= 8;
        }
        return { s: ptbl[i[0]], u: ctbl[i[1]] };
    }

    /**
     * Get a descrambler based on the descramble key pair from ctbl / ptbl
     */
    _lt_002(s, u) {
        return "=" === u.charAt(0) && "=" === s.charAt(0) ? new _speedbinb_f(u,s) : u.match(/^[0-9]/) && s.match(/^[0-9]/) ? new _speedbinb_a(u,s) : "" === u && "" === s ? new _speedbinb_h : null;
    }

    /**
     * Copied from official SpeedBinb library
     * t => imagecontext containing src property ('pages/cu77gvXE.jpg')
     * s, u descramble key pair, used to determine descrambler object
     * i => width of descrambled image
     * n => height of descrambled image
     */
    _getImageDescrambleCoords(/*t*/s, u, i, n) {
        var r = this._lt_002(s, u); // var r = this.lt(t.src);
        if (!r || !r.vt())
            return null;
        var e = r.dt({
            width: i,
            height: n
        });
        return {
            width: e.width,
            height: e.height,
            transfers: [{
                index: 0,
                coords: r.gt({
                    width: i,
                    height: n
                })
            }]
        };
    }

    /**
     * Copied from official SpeedBinb library
     * this seems not required, just validate array type ...
     */
    _toStringArray(t) {
        if (!Array.isArray(t))
            throw TypeError();
        if (t.some(function(t) {
            return "string" != typeof t;
        }))
            throw TypeError();
        return t;
    }

    /**
     * Copied from official SpeedBinb library
     * this seems not required, just validate array type ...
     */
    _toNumberArray(t) {
        if (!Array.isArray(t))
            throw TypeError();
        if (t.some(function(t) {
            return "number" != typeof t;
        }))
            throw TypeError();
        return t;
    }
}

/**
 *******************************
 *** Prototypes for SpeedBinb ***
 ******************************
 */

/**
 * Copied from official SpeedBinb library
 * define prototype for f
 */
var _speedbinb_f = function() {
    function s(t, i) {
        this.Mt = null;
        var n = t.match(/^=([0-9]+)-([0-9]+)([-+])([0-9]+)-([-_0-9A-Za-z]+)$/)
            , r = i.match(/^=([0-9]+)-([0-9]+)([-+])([0-9]+)-([-_0-9A-Za-z]+)$/);
        if (null !== n && null !== r && n[1] === r[1] && n[2] === r[2] && n[4] === r[4] && "+" === n[3] && "-" === r[3] && (this.C = parseInt(n[1], 10),
        this.I = parseInt(n[2], 10),
        this.jt = parseInt(n[4], 10),
        !(8 < this.C || 8 < this.I || 64 < this.C * this.I))) {
            var e = this.C + this.I + this.C * this.I;
            if (n[5].length === e && r[5].length === e) {
                var s = this.yt(n[5])
                    , u = this.yt(r[5]);
                this.xt = s.n,
                this.Et = s.t,
                this.It = u.n,
                this.St = u.t,
                this.Mt = [];
                for (var h = 0; h < this.C * this.I; h++)
                    this.Mt.push(s.p[u.p[h]]);
            }
        }
    }
    return s.prototype.vt = function() {
        return null !== this.Mt;
    }
    ,
    s.prototype.bt = function(t) {
        var i = 2 * this.C * this.jt
            , n = 2 * this.I * this.jt;
        return t.width >= 64 + i && t.height >= 64 + n && t.width * t.height >= (320 + i) * (320 + n);
    }
    ,
    s.prototype.dt = function(t) {
        return this.bt(t) ? {
            width: t.width - 2 * this.C * this.jt,
            height: t.height - 2 * this.I * this.jt
        } : t;
    }
    ,
    s.prototype.gt = function(t) {
        if (!this.vt())
            return null;
        if (!this.bt(t))
            return [{
                xsrc: 0,
                ysrc: 0,
                width: t.width,
                height: t.height,
                xdest: 0,
                ydest: 0
            }];
        for (var i = t.width - 2 * this.C * this.jt, n = t.height - 2 * this.I * this.jt, r = Math.floor((i + this.C - 1) / this.C), e = i - (this.C - 1) * r, s = Math.floor((n + this.I - 1) / this.I), u = n - (this.I - 1) * s, h = [], o = 0; o < this.C * this.I; ++o) {
            var a = o % this.C
                , f = Math.floor(o / this.C)
                , c = this.jt + a * (r + 2 * this.jt) + (this.It[f] < a ? e - r : 0)
                , l = this.jt + f * (s + 2 * this.jt) + (this.St[a] < f ? u - s : 0)
                , v = this.Mt[o] % this.C
                , d = Math.floor(this.Mt[o] / this.C)
                , g = v * r + (this.xt[d] < v ? e - r : 0)
                , p = d * s + (this.Et[v] < d ? u - s : 0)
                , b = this.It[f] === a ? e : r
                , m = this.St[a] === f ? u : s;
            0 < i && 0 < n && h.push({
                xsrc: c,
                ysrc: l,
                width: b,
                height: m,
                xdest: g,
                ydest: p
            });
        }
        return h;
    }
    ,
    s.prototype.yt = function(t) {
        var i, n = [], r = [], e = [];
        for (i = 0; i < this.C; i++)
            n.push(s.Tt[t.charCodeAt(i)]);
        for (i = 0; i < this.I; i++)
            r.push(s.Tt[t.charCodeAt(this.C + i)]);
        for (i = 0; i < this.C * this.I; i++)
            e.push(s.Tt[t.charCodeAt(this.C + this.I + i)]);
        return {
            t: n,
            n: r,
            p: e
        };
    }
    ,
    s.Tt = [-1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, 62, -1, -1, 52, 53, 54, 55, 56, 57, 58, 59, 60, 61, -1, -1, -1, -1, -1, -1, -1, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, -1, -1, -1, -1, 63, -1, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51, -1, -1, -1, -1, -1],
    s;
}();

/**
 * Copied from official SpeedBinb library
 * define prototype for a
 */
var _speedbinb_a = function() {
    function t(t, i) {
        this.mt = null,
        this.wt = null;
        var n = this.yt(t)
            , r = this.yt(i);
        n && r && n.ndx === r.ndx && n.ndy === r.ndy && (this.mt = n,
        this.wt = r);
    }
    return t.prototype.vt = function() {
        return null !== this.mt && null !== this.wt;
    }
    ,
    t.prototype.bt = function(t) {
        return 64 <= t.width && 64 <= t.height && 102400 <= t.width * t.height;
    }
    ,
    t.prototype.dt = function(t) {
        return t;
    }
    ,
    t.prototype.gt = function(t) {
        if (!this.vt())
            return null;
        if (!this.bt(t))
            return [{
                xsrc: 0,
                ysrc: 0,
                width: t.width,
                height: t.height,
                xdest: 0,
                ydest: 0
            }];
        for (var i = [], n = t.width - t.width % 8, r = Math.floor((n - 1) / 7) - Math.floor((n - 1) / 7) % 8, e = n - 7 * r, s = t.height - t.height % 8, u = Math.floor((s - 1) / 7) - Math.floor((s - 1) / 7) % 8, h = s - 7 * u, o = this.mt.piece.length, a = 0; a < o; a++) {
            var f = this.mt.piece[a]
                , c = this.wt.piece[a];
            i.push({
                xsrc: Math.floor(f.x / 2) * r + f.x % 2 * e,
                ysrc: Math.floor(f.y / 2) * u + f.y % 2 * h,
                width: Math.floor(f.w / 2) * r + f.w % 2 * e,
                height: Math.floor(f.h / 2) * u + f.h % 2 * h,
                xdest: Math.floor(c.x / 2) * r + c.x % 2 * e,
                ydest: Math.floor(c.y / 2) * u + c.y % 2 * h
            });
        }
        var l = r * (this.mt.ndx - 1) + e
            , v = u * (this.mt.ndy - 1) + h;
        return l < t.width && i.push({
            xsrc: l,
            ysrc: 0,
            width: t.width - l,
            height: v,
            xdest: l,
            ydest: 0
        }),
        v < t.height && i.push({
            xsrc: 0,
            ysrc: v,
            width: t.width,
            height: t.height - v,
            xdest: 0,
            ydest: v
        }),
        i;
    }
    ,
    t.prototype.yt = function(t) {
        if (!t)
            return null;
        var i = t.split("-");
        if (3 != i.length)
            return null;
        var n = parseInt(i[0], 10)
            , r = parseInt(i[1], 10)
            , e = i[2];
        if (e.length != n * r * 2)
            return null;
        for (var s, u, h, o, a = (n - 1) * (r - 1) - 1, f = a + (n - 1), c = f + (r - 1), l = c + 1, v = [], d = 0; d < n * r; d++)
            s = this.Ot(e.charAt(2 * d)),
            u = this.Ot(e.charAt(2 * d + 1)),
            d <= a ? o = h = 2 : d <= f ? (h = 2,
            o = 1) : d <= c ? (h = 1,
            o = 2) : d <= l && (o = h = 1),
            v.push({
                x: s,
                y: u,
                w: h,
                h: o
            });
        return {
            ndx: n,
            ndy: r,
            piece: v
        };
    }
    ,
    t.prototype.Ot = function(t) {
        var i = 0
            , n = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".indexOf(t);
        return n < 0 ? n = "abcdefghijklmnopqrstuvwxyz".indexOf(t) : i = 1,
        i + 2 * n;
    }
    ,
    t;
}();

/**
 * Copied from official SpeedBinb library
 * define prototype for h
 */
var _speedbinb_h = function() {
    function t() {}
    return t.prototype.vt = function() {
        return !0;
    }
    ,
    // eslint-disable-next-line no-unused-vars
    t.prototype.bt = function(t) {
        return !1;
    }
    ,
    t.prototype.dt = function(t) {
        return t;
    }
    ,
    t.prototype.gt = function(t) {
        return [{
            xsrc: 0,
            ysrc: 0,
            width: t.width,
            height: t.height,
            xdest: 0,
            ydest: 0
        }];
    }
    ,
    t;
}();