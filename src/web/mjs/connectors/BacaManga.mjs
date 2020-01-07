import WordPressEManga from './templates/WordPressEManga.mjs';

export default class BacaManga extends WordPressEManga {

    constructor() {
        super();
        super.id = 'bacamanga';
        super.label = 'BacaManga';
        this.tags = [ 'manga', 'indonesian' ];
        this.url = 'https://bacamanga.co';
        this.path = '/manga/?list';

        this.queryMangas = 'div#content div.soralist ul li a.series';
        this.queryChapters = 'div.bxcl ul li span.lchx a';
    }

    async _initializeConnector() {
        /*
         * sometimes cloudflare bypass will fail, because chrome successfully loads the page from its cache
         * => append random search parameter to avoid caching
         */
        let uri = new URL(this.path, this.url);
        uri.searchParams.set('ts', Date.now());
        uri.searchParams.set('rd', Math.random());
        let request = new Request(uri, this.requestOptions);
        await Engine.Request.fetchUI(request, '', 25000);
    }

    async _getPages(chapter) {
        let script = `
            var _0x5a7e=['RT/DoMKjw7rCgsKg','dHbDm8OELcKcFwbCgQ==','XXAsYUkPeDjCtwTDlcOmw4LDmiNqwrN4PFR4','w77CmyzDpy0=','VQjDmGrDpBE1w5rDpMKn','YMK8wqFZXw==','w4BSw65Fw4vCjsOUCsOcwpTCvsOfZVsnw4k=','w7EYw7BRbw==','Wn00bFkUdzjCuwnDgMKqw53DgH9qwqwj','eB7CjcOYEQ==','dcKPwr3DlhACwq8=','wqNsw5leJg==','ZcKMwrTDk8Ka','w4UJwrUCJiTDmA8QB1lEDwgxB1lIw6xHVSnDvETCgMKLwpbCnsOnMsKwwrguw5U=','OD18GWw=','d8KUw44=','wqM4esKUwqQ=','wrF8w7JyEA==','wp87FktB','NSdlEg==','JDR8CkY2VcKWw7vDtg0=','HDjDvMK1w6I=','woxKRMO9wpA=','TcK5w487Rw==','aMKpwqnDilY=','wqgYTw=='];(function(_0x560cfb,_0x28062a){var _0x15feb8=function(_0x235155){while(--_0x235155){_0x560cfb['push'](_0x560cfb['shift']());}};_0x15feb8(++_0x28062a);}(_0x5a7e,0x1a3));var _0x5117=function(_0x560cfb,_0x28062a){_0x560cfb=_0x560cfb-0x0;var _0x15feb8=_0x5a7e[_0x560cfb];if(_0x5117['JHkugp']===undefined){(function(){var _0x13080a=function(){var _0x1937a6;try{_0x1937a6=Function('return\x20(function()\x20'+'{}.constructor(\x22return\x20this\x22)(\x20)'+');')();}catch(_0x1a47b4){_0x1937a6=window;}return _0x1937a6;};var _0x57d99a=_0x13080a();var _0x1f08ef='ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';_0x57d99a['atob']||(_0x57d99a['atob']=function(_0x543705){var _0xad2710=String(_0x543705)['replace'](/=+$/,'');for(var _0x2fff6b=0x0,_0x18ec9a,_0x2ab19e,_0x5eb8d1=0x0,_0x28a170='';_0x2ab19e=_0xad2710['charAt'](_0x5eb8d1++);~_0x2ab19e&&(_0x18ec9a=_0x2fff6b%0x4?_0x18ec9a*0x40+_0x2ab19e:_0x2ab19e,_0x2fff6b++%0x4)?_0x28a170+=String['fromCharCode'](0xff&_0x18ec9a>>(-0x2*_0x2fff6b&0x6)):0x0){_0x2ab19e=_0x1f08ef['indexOf'](_0x2ab19e);}return _0x28a170;});}());var _0x3d8c8d=function(_0x431176,_0x28062a){var _0x24e37f=[],_0x4af179=0x0,_0x3dea05,_0x1c259d='',_0x5cace5='';_0x431176=atob(_0x431176);for(var _0x24e2e5=0x0,_0x279ed3=_0x431176['length'];_0x24e2e5<_0x279ed3;_0x24e2e5++){_0x5cace5+='%'+('00'+_0x431176['charCodeAt'](_0x24e2e5)['toString'](0x10))['slice'](-0x2);}_0x431176=decodeURIComponent(_0x5cace5);for(var _0xc2a3fd=0x0;_0xc2a3fd<0x100;_0xc2a3fd++){_0x24e37f[_0xc2a3fd]=_0xc2a3fd;}for(_0xc2a3fd=0x0;_0xc2a3fd<0x100;_0xc2a3fd++){_0x4af179=(_0x4af179+_0x24e37f[_0xc2a3fd]+_0x28062a['charCodeAt'](_0xc2a3fd%_0x28062a['length']))%0x100;_0x3dea05=_0x24e37f[_0xc2a3fd];_0x24e37f[_0xc2a3fd]=_0x24e37f[_0x4af179];_0x24e37f[_0x4af179]=_0x3dea05;}_0xc2a3fd=0x0;_0x4af179=0x0;for(var _0x1ac39b=0x0;_0x1ac39b<_0x431176['length'];_0x1ac39b++){_0xc2a3fd=(_0xc2a3fd+0x1)%0x100;_0x4af179=(_0x4af179+_0x24e37f[_0xc2a3fd])%0x100;_0x3dea05=_0x24e37f[_0xc2a3fd];_0x24e37f[_0xc2a3fd]=_0x24e37f[_0x4af179];_0x24e37f[_0x4af179]=_0x3dea05;_0x1c259d+=String['fromCharCode'](_0x431176['charCodeAt'](_0x1ac39b)^_0x24e37f[(_0x24e37f[_0xc2a3fd]+_0x24e37f[_0x4af179])%0x100]);}return _0x1c259d;};_0x5117['CTibJB']=_0x3d8c8d;_0x5117['vNnILh']={};_0x5117['JHkugp']=!![];}var _0x47cabe=_0x5117['vNnILh'][_0x560cfb];if(_0x47cabe===undefined){if(_0x5117['LsGjSk']===undefined){_0x5117['LsGjSk']=!![];}_0x15feb8=_0x5117['CTibJB'](_0x15feb8,_0x28062a);_0x5117['vNnILh'][_0x560cfb]=_0x15feb8;}else{_0x15feb8=_0x47cabe;}return _0x15feb8;};new Promise(_0x4481eb=>{var _0x34a1fe={};_0x34a1fe[_0x5117('0x0','pDEZ')]=_0x5117('0x1','9K!G');_0x34a1fe[_0x5117('0x2','t4Su')]=_0x5117('0x3','O5Af');_0x34a1fe[_0x5117('0x4','97J)')]=_0x5117('0x5','H&RU');_0x34a1fe[_0x5117('0x6','FV04')]=_0x5117('0x7','&y$i');_0x34a1fe[_0x5117('0x8','i]@l')]=function(_0xf14210,_0x2592ba){return _0xf14210(_0x2592ba);};_0x34a1fe[_0x5117('0x9','v[yb')]=_0x5117('0xa','F3)#');_0x34a1fe[_0x5117('0xb','ZWkV')]=_0x5117('0xc','#ws)');this[_0x34a1fe[_0x5117('0xd','Xotu')]]=(_0x16a5c3,_0x59889e)=>_0x16a5c3();document[_0x34a1fe[_0x5117('0x2','t4Su')]](_0x34a1fe[_0x5117('0xe','i]@l')])[_0x34a1fe[_0x5117('0xf','C6Wv')]](_0x281761=>this[_0x5117('0x10','ZWkV')](_0x281761[_0x5117('0x11','ZWkV')]));_0x34a1fe[_0x5117('0x12','(uy@')](_0x4481eb,[...document[_0x34a1fe[_0x5117('0x13','LtH]')]](_0x34a1fe[_0x5117('0x14','#ws)')])][_0x34a1fe[_0x5117('0x15','[Q7S')]](_0x2cd5d7=>_0x2cd5d7[_0x5117('0x16','Xotu')][_0x5117('0x17','UDUh')](_0x5117('0x18','FV04'),_0x5117('0x19','H&RU'))));});
        `;
        let request = new Request( this.url + chapter.id, this.requestOptions );
        return await Engine.Request.fetchUI(request, script);
    }
}