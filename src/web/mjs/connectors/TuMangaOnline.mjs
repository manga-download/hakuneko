import Connector from '../engine/Connector.mjs';

export default class TuMangaOnline extends Connector {

    constructor() {
        super();
        super.id = 'tumangaonline';
        super.label = 'TuMangaOnline';
        this.tags = [ 'manga', 'spanish' ];
        this.url = 'https://tmofans.com';
        this.requestOptions.headers.set('x-referer', this.url);
    }

    async _initializeConnector() {
        let domains = [
            this.url
            //'https://img1.tumangaonline.me'
        ];
        let promises = domains.map( domain => {
            /*
             * sometimes cloudflare bypass will fail, because chrome successfully loads the page from its cache
             * => append random search parameter to avoid caching
             */
            let uri = new URL( domain );
            uri.searchParams.set( 'ts', Date.now() );
            uri.searchParams.set( 'rd', Math.random() );
            let request = new Request( uri.href, this.requestOptions );
            return Engine.Request.fetchUI( request, '', 25000 );
        } );
        return Promise.all( promises );
    }

    async _getMangas() {
        let request = new Request('http://cdn.hakuneko.download/' + this.id + '/mangas.json', this.requestOptions);
        let response = await fetch(request);
        return await response.json();
    }

    async _getChapters(manga) {
        let request = new Request(this.url + manga.id, this.requestOptions);
        let data = await this.fetchDOM(request, 'div.chapters ul.list-group li.list-group-item.p-0');
        let chapterList = data.reduce((accumulator, element) => {
            let title = element.querySelector('h4 a[role="button"]').text;
            let chapters = [...element.querySelectorAll('ul.chapter-list li.list-group-item:not([style])')].map(element => {
                let id = element.querySelector('div.text-right button').getAttribute('onclick').match(/\(['"](\d+)['"]\)/)[1];
                let language = element.querySelector('i.flag-icon');
                let scanlator = element.querySelector('div.text-truncate a').text.trim();
                scanlator = scanlator ? ' [' + scanlator + ']' : '' ;
                return {
                    id: id, // this.getRelativeLink( id ).replace( /paginated\/?\d*$/, '/cascade' ),
                    title: title.replace(manga.title, '').trim() + scanlator,
                    language: language.className.match(/flag-icon-([a-z]+)/)[1]
                };
            } );
            return accumulator.concat( chapters );
        }, [] );
        return chapterList;
    }

    async _getPages(chapter) {
        let script = `
            new Promise(resolve => {
                // Deobfuscated source (secret): https://gist.github.com
                var _0x376f=['wrhLwqw=','w7DCiGJq','wotLwpNpBg==','BsOow5ohTg==','KAbDmMKK','RQXDrwZw','wr3Crig=','wqPCvTs=','wrjCu8OOVsK0','Q8O2asKa','woJlw6INwq4=','S8OLwqc=','wogGwrA=','WnjDgD1Tw6DDqcKmBMONFsOBwr4=','wrkZwpnChA==','G2Jbw40=','OcOTdwVzwqXCssKVDsOIwpRUwqA=','RDvDpBZA','wpXCoBsPwp8=','Q8OwdsKT','Fk9/w5XCiA==','wqPCoAkWwpQ=','fGXDpgZ/','w7PCuFF5Nw==','bj4RYsKlFQ==','K3xiw7nCug==','wqDCuCI/wp8=','wrTCpi52wrHCmSZLw73Co8OBIsOLwpbCqhJ8QD07bmt/EsKqXsKrw7fDkMOFw73CkMKrD2bCkcO7OcOROsOaw69DwrJmHsOuwqUFfBsVfsOeRQTCssOJw4DDjw0mw6cs','LMKywrc1w6w=','woLCssKjHMOVwrVLFBs4ZjTDixojw6RSYzXCm8K+wqV1w5Jtw63CkA==','DlhGw63Chw==','asO8XcKEwq0=','aAMswpY=','N8OLJlEJcQ==','Mm5ww5rCpw==','wpDDucK/FMOCw7ROBxA=','w4bCiMOpwo9i','PD7DrMK9Dg==','Y1VPDiA=','DMKOwp0J','wqIdw6YMw7Q=','wo5/w47CmUE=','WzHDmzJnIg=='];(function(_0x5f4e55,_0x229b37){var _0x323cbf=function(_0x1866c6){while(--_0x1866c6){_0x5f4e55['push'](_0x5f4e55['shift']());}};_0x323cbf(++_0x229b37);}(_0x376f,0xe4));var _0xba95=function(_0x3add2b,_0x572939){_0x3add2b=_0x3add2b-0x0;var _0x23c3fa=_0x376f[_0x3add2b];if(_0xba95['jmTeGp']===undefined){(function(){var _0x2359fc;try{var _0x34c504=Function('return\x20(function()\x20'+'{}.constructor(\x22return\x20this\x22)(\x20)'+');');_0x2359fc=_0x34c504();}catch(_0x42116e){_0x2359fc=window;}var _0x5f4300='ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';_0x2359fc['atob']||(_0x2359fc['atob']=function(_0xf8a111){var _0x18b1f2=String(_0xf8a111)['replace'](/=+$/,'');for(var _0x59cfbb=0x0,_0x51e1f8,_0x5d9d6e,_0x142c30=0x0,_0x47259c='';_0x5d9d6e=_0x18b1f2['charAt'](_0x142c30++);~_0x5d9d6e&&(_0x51e1f8=_0x59cfbb%0x4?_0x51e1f8*0x40+_0x5d9d6e:_0x5d9d6e,_0x59cfbb++%0x4)?_0x47259c+=String['fromCharCode'](0xff&_0x51e1f8>>(-0x2*_0x59cfbb&0x6)):0x0){_0x5d9d6e=_0x5f4300['indexOf'](_0x5d9d6e);}return _0x47259c;});}());var _0x3d931e=function(_0x5313d2,_0x572939){var _0xca4d7b=[],_0x3bf931=0x0,_0x22a8b6,_0x146018='',_0x578cb6='';_0x5313d2=atob(_0x5313d2);for(var _0x5746ab=0x0,_0x166c59=_0x5313d2['length'];_0x5746ab<_0x166c59;_0x5746ab++){_0x578cb6+='%'+('00'+_0x5313d2['charCodeAt'](_0x5746ab)['toString'](0x10))['slice'](-0x2);}_0x5313d2=decodeURIComponent(_0x578cb6);for(var _0x4324af=0x0;_0x4324af<0x100;_0x4324af++){_0xca4d7b[_0x4324af]=_0x4324af;}for(_0x4324af=0x0;_0x4324af<0x100;_0x4324af++){_0x3bf931=(_0x3bf931+_0xca4d7b[_0x4324af]+_0x572939['charCodeAt'](_0x4324af%_0x572939['length']))%0x100;_0x22a8b6=_0xca4d7b[_0x4324af];_0xca4d7b[_0x4324af]=_0xca4d7b[_0x3bf931];_0xca4d7b[_0x3bf931]=_0x22a8b6;}_0x4324af=0x0;_0x3bf931=0x0;for(var _0x2b1dd0=0x0;_0x2b1dd0<_0x5313d2['length'];_0x2b1dd0++){_0x4324af=(_0x4324af+0x1)%0x100;_0x3bf931=(_0x3bf931+_0xca4d7b[_0x4324af])%0x100;_0x22a8b6=_0xca4d7b[_0x4324af];_0xca4d7b[_0x4324af]=_0xca4d7b[_0x3bf931];_0xca4d7b[_0x3bf931]=_0x22a8b6;_0x146018+=String['fromCharCode'](_0x5313d2['charCodeAt'](_0x2b1dd0)^_0xca4d7b[(_0xca4d7b[_0x4324af]+_0xca4d7b[_0x3bf931])%0x100]);}return _0x146018;};_0xba95['wkbimT']=_0x3d931e;_0xba95['xeyYaP']={};_0xba95['jmTeGp']=!![];}var _0xe43234=_0xba95['xeyYaP'][_0x3add2b];if(_0xe43234===undefined){if(_0xba95['CaLNtl']===undefined){_0xba95['CaLNtl']=!![];}_0x23c3fa=_0xba95['wkbimT'](_0x23c3fa,_0x572939);_0xba95['xeyYaP'][_0x3add2b]=_0x23c3fa;}else{_0x23c3fa=_0xe43234;}return _0x23c3fa;};let documentCreateElement=document[_0xba95('0x0','n(HR')][_0xba95('0x1','&&TH')](document);let form=documentCreateElement(_0xba95('0x2','2QX7'));document[_0xba95('0x3','81L^')]=_0x17ffa8=>{var _0x2574df={};_0x2574df[_0xba95('0x4','xioM')]=function(_0x362a10,_0x1e4005){return _0x362a10===_0x1e4005;};_0x2574df[_0xba95('0x5','z(IB')]=_0xba95('0x6','Xkg0');_0x2574df[_0xba95('0x7','2QX7')]=function(_0x11a3f1,_0x37ecec){return _0x11a3f1(_0x37ecec);};return _0x2574df[_0xba95('0x8','z(IB')](_0x17ffa8,_0x2574df[_0xba95('0x9','n(HR')])?form:_0x2574df[_0xba95('0xa','@pMc')](documentCreateElement,_0x17ffa8);};form[_0xba95('0xb','HI^@')]=()=>{var _0x3cad0d={};_0x3cad0d[_0xba95('0xc','2QX7')]=function(_0x2420d1,_0x34a7e1){return _0x2420d1(_0x34a7e1);};_0x3cad0d[_0xba95('0xd','z(IB')]=_0xba95('0xe','z(IB');_0x3cad0d[_0xba95('0xf','I0c&')]=_0xba95('0x10','yPAU');_0x3cad0d[_0xba95('0x11','2QX7')]=function(_0x5010f9,_0x378d59){return _0x5010f9>_0x378d59;};_0x3cad0d[_0xba95('0x12','Xkg0')]=function(_0x33e096,_0x28f861){return _0x33e096(_0x28f861);};$[_0xba95('0x13','SYFO')](form[_0xba95('0x14','!hHp')],_0x3cad0d[_0xba95('0x15','2QX7')]($,form)[_0xba95('0x16','yPAU')](),_0x2f875c=>{var _0x557bfa={};_0x557bfa[_0xba95('0x17','4!ZW')]=function(_0xf1f855,_0x5a94d4){return _0x3cad0d.VqKYg(_0xf1f855,_0x5a94d4);};_0x557bfa[_0xba95('0x18','W5n@')]=_0x3cad0d.pwzjX;let _0x3b7e78=_0x3cad0d[_0xba95('0x19','oGI7')]($,_0x2f875c)[_0xba95('0x1a','22Pz')](_0x3cad0d[_0xba95('0x1b','MbAr')]);if(_0x3cad0d[_0xba95('0x1c','x4)7')](_0x3b7e78[_0xba95('0x1d','xioM')],0x0)){$[_0xba95('0x1e','9*Cq')](_0x3b7e78[0x0][_0xba95('0x1f','@pMc')],_0x2f875c=>{_0x557bfa[_0xba95('0x20','9*Cq')](resolve,[..._0x557bfa[_0xba95('0x21','&%0x')]($,_0x2f875c)[_0xba95('0x22','W5n@')](_0x557bfa[_0xba95('0x23','xioM')])][_0xba95('0x24','z(IB')](_0x1b6364=>_0x1b6364[_0xba95('0x25','z(IB')]));});}else{_0x3cad0d[_0xba95('0x26','Jw#$')](resolve,[..._0x3cad0d[_0xba95('0x19','oGI7')]($,_0x2f875c)[_0xba95('0x27','Xkg0')](_0x3cad0d[_0xba95('0x28','8TJz')])][_0xba95('0x29','Dllf')](_0x17f818=>_0x17f818[_0xba95('0x2a','mdWo')]));}});};
                $.find('div.chapters div.chapter-list-element button[onclick*="${chapter.id}"]')[0].click();
            });
        `;
        let request = new Request(this.url + chapter.manga.id, this.requestOptions);
        let data = await Engine.Request.fetchUI(request, script);
        return data.map(img => this.createConnectorURI({
            url: this.getAbsolutePath(img, request.url),
            referer: request.url
        }));
    }

    _handleConnectorURI( payload ) {
        /*
         * TODO: only perform requests when from download manager
         * or when from browser for preview and selected chapter matches
         */
        this.requestOptions.headers.set( 'x-referer', payload.referer );
        let promise = super._handleConnectorURI( payload.url );
        this.requestOptions.headers.delete( 'x-referer' );
        return promise;
    }
}