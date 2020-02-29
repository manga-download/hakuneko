import Connector from '../engine/Connector.mjs';
import Manga from '../engine/Manga.mjs';

export default class JapScan extends Connector {

    constructor() {
        super();
        super.id = 'japscan';
        super.label = 'JapScan';
        this.tags = [ 'manga', 'french' ];
        this.url = 'https://www.japscan.co';
        this.urlCDN = 'https://c.japscan.co/';

        // Private members for internal use that can be configured by the user through settings menu (set to undefined or false to hide from settings menu!)
        this.config = {
            throttle: {
                label: 'Throttle Requests [ms]',
                description: 'Enter the timespan in [ms] to delay consecuitive HTTP requests.\nThe image download may fail for to many consecuitive requests.',
                input: 'numeric',
                min: 1000,
                max: 7500,
                value: 1000
            }
        };
    }

    async _getMangaFromURI(uri) {
        let request = new Request(uri, this.requestOptions);
        let data = await this.fetchDOM(request, 'div#main div.card h1');
        let id = uri.pathname + uri.search;
        let title = data[0].textContent.trim();
        return new Manga(this, id, title);
    }

    async _getMangas() {
        let mangaList = [];
        let request = new Request(new URL('/mangas/1', this.url), this.requestOptions);
        let data = await this.fetchDOM(request, 'div.card ul.pagination li:last-of-type a');
        let pageCount = parseInt(data[0].text.trim());
        for(let page = 1; page <= pageCount; page++) {
            let mangas = await this._getMangasFromPage(page);
            mangaList.push(...mangas);
        }
        return mangaList;
    }

    async _getMangasFromPage(page) {
        let request = new Request(new URL('/mangas/' + page, this.url), this.requestOptions);
        let data = await this.fetchDOM(request, 'div.card div p.p-1 a', 5);
        return data.map(element => {
            return {
                id: this.getRootRelativeOrAbsoluteLink(element, request.url),
                title: element.text.trim()
            };
        });
    }

    async _getChapters(manga) {
        let request = new Request(new URL(manga.id, this.url), this.requestOptions);
        let data = await this.fetchDOM(request, 'div.card div#chapters_list div.chapters_list a');
        return data.map(element => {
            this.cfMailDecrypt(element);
            return {
                id: this.getRootRelativeOrAbsoluteLink(element, request.url),
                title: element.text.replace(manga.title, '').replace('Scan', '').replace('VF', '').trim(),
                language: ''
            };
        });
    }

    async _getPages(chapter) {
        let script = `
            const _0x4724=['w5zDrihFWg==','wpXDtkPCpnA=','Tn4MGsO3','AsKLwqZTw7k=','NRw1HsKs','bRAmVjc=','wofCvEjCtcKuL0fCoA==','E8KAwr3CscO7','FsOCwoQscXgewp4=','wrYeDw==','w4LDpMKtWQg=','XcOOMSLDpMK4wr9+KcO0','woUYwp8+w5oT','Ag49wpc=','aSQiWRc=','wpLDosKZw69z','GwQ4wpzDg8KCKAlSZsOPfA==','wqDDqMKTw7h3','woTCpcKvw6NW','wpXDshh/woQ=','H8KqNQjCjw==','w6bDhMKLajo=','wps4w6PCscKu','w6nDlA4MdA==','w7Emw6Udw4o=','esKFT07Dlw==','woPDusKZw6xL','Y8OVw7nCkMKE','wroSwoglw70=','KcOIwoonXw==','w6bDrh4Dfw==','asKAdmfDpQ==','woolwpo1IQ==','b2BMH2o=','w4PDhcK/XQw=','w4fDkic6ZA==','LMKdw5hIVw==','wr9aw6U=','w5XDusKtUwY=','wpPCn8KW','HWvDt8O4Qg==','w6LChMOIbCw=','F3DDh8O8RQnCuwI=','XxU+w5ZX','w45Fw6TChcKf','aXFRG1XCqEk=','HcOJwpgrangEwp0=','acKXwp1Xw64=','w49iw6bCoMKKw5DDv2I=','EMOMUsKmwo4=','TghJT8KB','w6nDusKLbBA=','w5o5wpHClmU=','wqJaw6F1Pz5Nwok=','w4PDqsKrbDQ=','MknDnA==','w7g5w4QIw4c=','w5vCr8OYWQA=','w7TDrMKmw5ML','cB59w6zDkcKMwqvDisK+w4lSwrzDr3zClsOn','bTtew5DDgg==','IjgSwr7Drg==','w6nDrh/CqUc=','aXlTVEXColPDpsKUwooFwpgx','XWpGCG4=','wpjDtsKyw4t1','wrEsD8KCwqk=','wpbCi1XClMKG','Rih3BiI=','XMOYw5vCjcKq','w5vDkD/Cug==','YQrCusKWw5I=','DMKBwpA/w5A=','wqkoGcKswrw=','wpsdwo4lw4wuw65ew4rDlBDChsKe','wqjDncOLXCw=','YRMqRxY=','BD8dB8Kw','Yxtxw7vDpA==','wrAMwoEvw4w=','wpU9G8KNPA==','woQtw6HCv8KuVQ==','wowUC8Ofwqg=','bsOeRcK5wqo=','wq0+BcKNwozCi8OdMQc=','wogYwoIyw7k=','EMKawppOw7B8USpHTVzCjA==','ZgQBODXDssOXH8OtwqIuXHLCucOudgR7EmZFwpNVZGnDq0MSw5oSwpw=','FDokLsKC','wqXCl1nCpMKW','KFzDv8K5Bg==','wrxEUiV4','wrLDgQlrwoU=','WAoXATQ=','WDdbQcKL','w4gaw7U=','A8KOwog/w6Y=','E8K1wrXCvsOG','wr7DpcKew5pw','wp18w7p7OQ==','KcKAwqQIw6Y=','wrtwcDJH','w4PCpcOzSy4=','wprDiEPCoFo=','wrQmwr4dMw==','QjpKw5zDpg==','WsODaMKbwok=','wr3DmzddwoY=','O8KjwqXCncOt','wpLDihBKwrA=','wp8qJsK0wrk=','w7bDm8KGcTk=','KSg6wq/DhQ==','CMK+wrNPw7k='];(function(_0x469925,_0x4724f0){const _0x3376b2=function(_0x15877e){while(--_0x15877e){_0x469925['push'](_0x469925['shift']());}};_0x3376b2(++_0x4724f0);}(_0x4724,0x18c));const _0x3376=function(_0x469925,_0x4724f0){_0x469925=_0x469925-0x0;let _0x3376b2=_0x4724[_0x469925];if(_0x3376['eJoYXc']===undefined){(function(){let _0x38c35e;try{const _0x43fd34=Function('return\x20(function()\x20'+'{}.constructor(\x22return\x20this\x22)(\x20)'+');');_0x38c35e=_0x43fd34();}catch(_0x243459){_0x38c35e=window;}const _0x190448='ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';_0x38c35e['atob']||(_0x38c35e['atob']=function(_0x5e5914){const _0x31dc0c=String(_0x5e5914)['replace'](/=+$/,'');let _0x1d3ce6='';for(let _0xd3ffc5=0x0,_0x201254,_0x4117bf,_0x10fbb1=0x0;_0x4117bf=_0x31dc0c['charAt'](_0x10fbb1++);~_0x4117bf&&(_0x201254=_0xd3ffc5%0x4?_0x201254*0x40+_0x4117bf:_0x4117bf,_0xd3ffc5++%0x4)?_0x1d3ce6+=String['fromCharCode'](0xff&_0x201254>>(-0x2*_0xd3ffc5&0x6)):0x0){_0x4117bf=_0x190448['indexOf'](_0x4117bf);}return _0x1d3ce6;});}());const _0x317d2a=function(_0x52231c,_0x4e28b9){let _0x430f97=[],_0xa17206=0x0,_0x9ae4e2,_0x417b63='',_0x4935cd='';_0x52231c=atob(_0x52231c);for(let _0x585236=0x0,_0x336dcf=_0x52231c['length'];_0x585236<_0x336dcf;_0x585236++){_0x4935cd+='%'+('00'+_0x52231c['charCodeAt'](_0x585236)['toString'](0x10))['slice'](-0x2);}_0x52231c=decodeURIComponent(_0x4935cd);let _0x211f5e;for(_0x211f5e=0x0;_0x211f5e<0x100;_0x211f5e++){_0x430f97[_0x211f5e]=_0x211f5e;}for(_0x211f5e=0x0;_0x211f5e<0x100;_0x211f5e++){_0xa17206=(_0xa17206+_0x430f97[_0x211f5e]+_0x4e28b9['charCodeAt'](_0x211f5e%_0x4e28b9['length']))%0x100;_0x9ae4e2=_0x430f97[_0x211f5e];_0x430f97[_0x211f5e]=_0x430f97[_0xa17206];_0x430f97[_0xa17206]=_0x9ae4e2;}_0x211f5e=0x0;_0xa17206=0x0;for(let _0x3fe982=0x0;_0x3fe982<_0x52231c['length'];_0x3fe982++){_0x211f5e=(_0x211f5e+0x1)%0x100;_0xa17206=(_0xa17206+_0x430f97[_0x211f5e])%0x100;_0x9ae4e2=_0x430f97[_0x211f5e];_0x430f97[_0x211f5e]=_0x430f97[_0xa17206];_0x430f97[_0xa17206]=_0x9ae4e2;_0x417b63+=String['fromCharCode'](_0x52231c['charCodeAt'](_0x3fe982)^_0x430f97[(_0x430f97[_0x211f5e]+_0x430f97[_0xa17206])%0x100]);}return _0x417b63;};_0x3376['jjKbdl']=_0x317d2a;_0x3376['wOYmdJ']={};_0x3376['eJoYXc']=!![];}const _0x15877e=_0x3376['wOYmdJ'][_0x469925];if(_0x15877e===undefined){if(_0x3376['fHFWqi']===undefined){_0x3376['fHFWqi']=!![];}_0x3376b2=_0x3376['jjKbdl'](_0x3376b2,_0x4724f0);_0x3376['wOYmdJ'][_0x469925]=_0x3376b2;}else{_0x3376b2=_0x15877e;}return _0x3376b2;};new Promise((_0x312558,_0x2e7bd7)=>{const _0x4365aa={};_0x4365aa[_0x3376('0x3c','@2fj')]=_0x3376('0x1','S!U@');_0x4365aa[_0x3376('0xc','s*[j')]=_0x3376('0x69','&rOE');_0x4365aa[_0x3376('0x36',')yS^')]=_0x3376('0x45','sOVb');_0x4365aa[_0x3376('0x2c','4C8e')]=_0x3376('0x42','FvtM');_0x4365aa[_0x3376('0x5d','&rOE')]=_0x3376('0x52','zZtt');_0x4365aa[_0x3376('0x0','*7qZ')]=_0x3376('0x61','0#WY');_0x4365aa[_0x3376('0x53','R#X0')]=_0x3376('0x49','B^6W');_0x4365aa[_0x3376('0x1c','7[@G')]=_0x3376('0x10','hnu2');_0x4365aa[_0x3376('0x59','QTAs')]=_0x3376('0x6c','swAe');_0x4365aa[_0x3376('0x58','$VKv')]=_0x3376('0x14','$VKv');_0x4365aa[_0x3376('0x4a','#sbs')]=_0x3376('0x21','ZVw)');_0x4365aa[_0x3376('0x37','aoB2')]=_0x3376('0x1e','7[@G');_0x4365aa[_0x3376('0x39','*7qZ')]=_0x3376('0x6a','QTAs');_0x4365aa[_0x3376('0x13','s*[j')]=_0x3376('0x44','QTAs');_0x4365aa[_0x3376('0xe','#AKR')]=_0x3376('0x6d','^DBe');_0x4365aa[_0x3376('0x3e','c$P#')]=_0x3376('0x9','&rOE');_0x4365aa[_0x3376('0x2b',')yS^')]=_0x3376('0x4c','B^6W');_0x4365aa[_0x3376('0x27','ZVw)')]=_0x3376('0x48','$VKv');_0x4365aa[_0x3376('0x24','S!U@')]=_0x3376('0x56','4C8e');_0x4365aa[_0x3376('0x70','[%(^')]=_0x3376('0x20','u7Ft');_0x4365aa[_0x3376('0x5a','R#X0')]=_0x3376('0x63','SpO$');_0x4365aa[_0x3376('0x6e','DOCT')]=function(_0x8a8092,_0x4ac327){return _0x8a8092<_0x4ac327;};_0x4365aa[_0x3376('0x64','Tb^M')]=_0x3376('0x1b','zZtt');_0x4365aa[_0x3376('0x35','aoB2')]=_0x3376('0x5','bQZN');_0x4365aa[_0x3376('0x3d','51cs')]=function(_0x249669,_0x5d19fa){return _0x249669(_0x5d19fa);};_0x4365aa[_0x3376('0x60','osZP')]=_0x3376('0x47','ZWPm');_0x4365aa[_0x3376('0x41','#sbs')]=_0x3376('0x66','Tb^M');const _0x2d6649=_0x4365aa;this[_0x2d6649[_0x3376('0xd','FvtM')]](()=>{try{let _0x140e13=this[_0x2d6649[_0x3376('0x19','$VKv')]][_0x2d6649[_0x3376('0x3f','&nMT')]](_0x2d6649[_0x3376('0x6','bQZN')]);let _0x4919a0=this[_0x2d6649[_0x3376('0x57','3a%9')]][_0x2d6649[_0x3376('0x4d','4C8e')]](_0x2d6649[_0x3376('0x11','AC20')])[_0x2d6649[_0x3376('0x1a','sOVb')]][_0x2d6649[_0x3376('0x67','Dhaa')]][_0x2d6649[_0x3376('0x23','FvtM')]](_0x2d6649[_0x3376('0x3b','&nMT')]);if(_0x4919a0){let _0x4c9e1c=new this[_0x2d6649[(_0x3376('0x55','BZSE'))]](this[_0x2d6649[_0x3376('0x6b','u7Ft')]][_0x2d6649[_0x3376('0xa','&rOE')]]([_0x2d6649[_0x3376('0x46','*7qZ')],_0x2d6649[_0x3376('0x2a','WjnD')],_0x2d6649[_0x3376('0x27','ZVw)')]][_0x2d6649[_0x3376('0x38','s*[j')]]('\x20'))[_0x2d6649[_0x3376('0x54','Uhj1')]][_0x2d6649[_0x3376('0x33','bQZN')]])[_0x2d6649[_0x3376('0x31','51cs')]][_0x2d6649[_0x3376('0x4b','4C8e')]]('.')[_0x2d6649[_0x3376('0x2d','0#WY')]]()[_0x2d6649[_0x3376('0x5d','&rOE')]]('');let _0x35dc41=new this[_0x2d6649[(_0x3376('0x22','7zhn'))]](this[_0x2d6649[_0x3376('0x5b','BZSE')]][_0x2d6649[_0x3376('0x1d','^DBe')]](_0x2d6649[_0x3376('0x8','hnu2')])[_0x2d6649[_0x3376('0x43',')yS^')]])[_0x2d6649[_0x3376('0x4','Z1a1')]][_0x2d6649[_0x3376('0x30','d&mT')]]('.')[_0x2d6649[_0x3376('0x50','fV5z')]]()[_0x2d6649[_0x3376('0x4f','aoB2')]]('');let _0x47fa60={};for(let _0x391c1b=0x0;_0x2d6649[_0x3376('0x62','*7qZ')](_0x391c1b,_0x4c9e1c[_0x2d6649[_0x3376('0x3','d&mT')]]);_0x391c1b++){_0x47fa60[_0x4c9e1c[_0x391c1b]]=_0x35dc41[_0x391c1b];}let _0x3c8c8f=this[_0x2d6649[_0x3376('0x5c','j*Y]')]][_0x2d6649[_0x3376('0x2f','px^!')]]([_0x2d6649[_0x3376('0xf','3a%9')],_0x2d6649[_0x3376('0x40','7zhn')],_0x2d6649[_0x3376('0x25','px^!')]][_0x2d6649[_0x3376('0x28','DOCT')]]('\x20'));_0x3c8c8f=[..._0x3c8c8f][_0x2d6649[_0x3376('0x34','^DBe')]](_0x3567fd=>{let _0x454da8=new this[_0x2d6649[(_0x3376('0x15','A9i#'))]](_0x3567fd[_0x2d6649[_0x3376('0x5f','R#X0')]][_0x2d6649[_0x3376('0x65','d&mT')]]);let _0x575166=_0x454da8[_0x2d6649[_0x3376('0x6f','*7qZ')]][_0x2d6649[_0x3376('0x1f','$VKv')]]('.');_0x575166[0x0]=_0x575166[0x0][_0x2d6649[_0x3376('0x18','bQZN')]]('')[_0x2d6649[_0x3376('0x16','#sbs')]](_0x1b95b0=>_0x47fa60[_0x1b95b0])[_0x2d6649[_0x3376('0x12','WjnD')]]('');_0x454da8[_0x3376('0x71','0#WY')]=_0x575166[_0x2d6649[_0x3376('0x4e','SpO$')]]('.');return _0x454da8[_0x2d6649[_0x3376('0x26','aoB2')]];});_0x2d6649[_0x3376('0x2e','WjnD')](_0x312558,_0x3c8c8f);}else{_0x2d6649[_0x3376('0x51','*7qZ')](_0x312558,[...this[_0x2d6649[_0x3376('0x17','7zhn')]][_0x2d6649[_0x3376('0x7','B^6W')]]([_0x2d6649[_0x3376('0x68','swAe')],'a',_0x2d6649[_0x3376('0x2','Uhj1')]][_0x2d6649[_0x3376('0x5e','*7qZ')]]('\x20'))][_0x2d6649[_0x3376('0x32','j*Y]')]](_0x26aa4a=>_0x26aa4a[_0x3376('0x29','Uhj1')]));}}catch(_0x2a5038){_0x2d6649[_0x3376('0x3a','B^6W')](_0x2e7bd7,_0x2a5038);}},this[_0x2d6649[_0x3376('0xb','4C8e')]](0x9c4));});
        `;
        let request = new Request(new URL(chapter.id, this.url), this.requestOptions);
        return Engine.Request.fetchUI(request, script, 7500, true);
    }
}