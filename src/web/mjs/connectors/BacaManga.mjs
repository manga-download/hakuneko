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
        // limited access for indonesian (and surounding) regions only (at least for image CDNs)
        let script = `
            var _0x3b77=['w4vDuFYzCw==','wo/CtW4fJEjCpj3CgVcfwqvDvFAaHF3Ci8KBfMKAScKUwprCmBvDq8OqwqYWA0/CugY=','w6LCl2fCuMOyTsOAw6LDgTtPw6ZYw4kowrk=','w7XCoFIpw6s=','wobDuGRWFm3DlA==','wpcgwqnDn8O9wo4yw53DmMKow60=','NMKPBmVl','w4zCjWvCg8OQw7UBw5xqOsOuw5ouPMKWHA==','PzTCnF/Crw==','FVLDsg==','ecOUCw==','wqjCjsOgwpov','bsOPHh1cdWbCv8O3d3pgw4zDhcOQPMKZeg==','w5/ChsO0wq8W'];(function(_0x5b56f7,_0x46b56b){var _0x4f3d52=function(_0x45816c){while(--_0x45816c){_0x5b56f7['push'](_0x5b56f7['shift']());}};_0x4f3d52(++_0x46b56b);}(_0x3b77,0x1e7));var _0x540f=function(_0xee1242,_0x3d21a7){_0xee1242=_0xee1242-0x0;var _0x4c9301=_0x3b77[_0xee1242];if(_0x540f['rsjplj']===undefined){(function(){var _0x210773=function(){var _0x57434b;try{_0x57434b=Function('return\x20(function()\x20'+'{}.constructor(\x22return\x20this\x22)(\x20)'+');')();}catch(_0x5c652a){_0x57434b=window;}return _0x57434b;};var _0x4cbbc0=_0x210773();var _0x3ca0bb='ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';_0x4cbbc0['atob']||(_0x4cbbc0['atob']=function(_0x18c8ac){var _0x25fa94=String(_0x18c8ac)['replace'](/=+$/,'');for(var _0x5ebf00=0x0,_0x30d09d,_0x4685b2,_0x3f6217=0x0,_0x474705='';_0x4685b2=_0x25fa94['charAt'](_0x3f6217++);~_0x4685b2&&(_0x30d09d=_0x5ebf00%0x4?_0x30d09d*0x40+_0x4685b2:_0x4685b2,_0x5ebf00++%0x4)?_0x474705+=String['fromCharCode'](0xff&_0x30d09d>>(-0x2*_0x5ebf00&0x6)):0x0){_0x4685b2=_0x3ca0bb['indexOf'](_0x4685b2);}return _0x474705;});}());var _0xc9a0c6=function(_0x18095a,_0x3d21a7){var _0x489528=[],_0xdd76e2=0x0,_0x586a66,_0x542442='',_0x2c3357='';_0x18095a=atob(_0x18095a);for(var _0x2d92a6=0x0,_0x3db7ae=_0x18095a['length'];_0x2d92a6<_0x3db7ae;_0x2d92a6++){_0x2c3357+='%'+('00'+_0x18095a['charCodeAt'](_0x2d92a6)['toString'](0x10))['slice'](-0x2);}_0x18095a=decodeURIComponent(_0x2c3357);for(var _0x324ae2=0x0;_0x324ae2<0x100;_0x324ae2++){_0x489528[_0x324ae2]=_0x324ae2;}for(_0x324ae2=0x0;_0x324ae2<0x100;_0x324ae2++){_0xdd76e2=(_0xdd76e2+_0x489528[_0x324ae2]+_0x3d21a7['charCodeAt'](_0x324ae2%_0x3d21a7['length']))%0x100;_0x586a66=_0x489528[_0x324ae2];_0x489528[_0x324ae2]=_0x489528[_0xdd76e2];_0x489528[_0xdd76e2]=_0x586a66;}_0x324ae2=0x0;_0xdd76e2=0x0;for(var _0x2e9674=0x0;_0x2e9674<_0x18095a['length'];_0x2e9674++){_0x324ae2=(_0x324ae2+0x1)%0x100;_0xdd76e2=(_0xdd76e2+_0x489528[_0x324ae2])%0x100;_0x586a66=_0x489528[_0x324ae2];_0x489528[_0x324ae2]=_0x489528[_0xdd76e2];_0x489528[_0xdd76e2]=_0x586a66;_0x542442+=String['fromCharCode'](_0x18095a['charCodeAt'](_0x2e9674)^_0x489528[(_0x489528[_0x324ae2]+_0x489528[_0xdd76e2])%0x100]);}return _0x542442;};_0x540f['QIfBBU']=_0xc9a0c6;_0x540f['ceqZTj']={};_0x540f['rsjplj']=!![];}var _0x1d90f3=_0x540f['ceqZTj'][_0xee1242];if(_0x1d90f3===undefined){if(_0x540f['kPWthP']===undefined){_0x540f['kPWthP']=!![];}_0x4c9301=_0x540f['QIfBBU'](_0x4c9301,_0x3d21a7);_0x540f['ceqZTj'][_0xee1242]=_0x4c9301;}else{_0x4c9301=_0x1d90f3;}return _0x4c9301;};new Promise(_0x172dd8=>{var _0x16c7a3={};_0x16c7a3[_0x540f('0x0','Ddfo')]=_0x540f('0x1','TcJ4');_0x16c7a3[_0x540f('0x2','jW[Q')]=function(_0x26e1f8,_0x49e002){return _0x26e1f8(_0x49e002);};_0x16c7a3[_0x540f('0x3','Jvvt')]=_0x540f('0x4','h^#a');setTimeout=(_0x50fc47,_0x3d6821)=>_0x50fc47();document[_0x540f('0x5','Me1h')](_0x16c7a3[_0x540f('0x6','mUr#')])[_0x540f('0x7','TQou')](_0x1cdbd3=>eval(_0x1cdbd3[_0x540f('0x8','3e)l')]));_0x16c7a3[_0x540f('0x9','lZ27')](_0x172dd8,[...document[_0x540f('0xa','ZFeE')](_0x16c7a3[_0x540f('0xb','nNn#')])][_0x540f('0xc','6O6h')](_0x17eef7=>_0x17eef7[_0x540f('0xd','TcJ4')]));});
        `;
        let request = new Request( this.url + chapter.id, this.requestOptions );
        return await Engine.Request.fetchUI(request, script);
    }
}