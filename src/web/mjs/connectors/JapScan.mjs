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
            const _0x3496=['wrh4w7DDoBc=','IsO3wrnDlFI=','wqMAwoQiw4E=','KjZGw6rDjA==','YWjDl8ORQQ==','w7JXwrfCpRhx','wptKwoDCii0=','GMKiw7kLw7rCqsOJVHg=','eMKpw4tgwrI=','I8O5SQlo','UWMQEsKM','woBaw5c=','GMONK3LDlA==','S8O1FznCkA==','wrjDj0fClj4=','w4dkRGdww6XDvn7ClXMiw41wMBbDucO1w5fClcKyUAbDrcKnwo/DncKKKcKYwr/Cqg==','I8Oyw47Ds2E=','wqh8wo04cw==','Hj7CkUUh','w45Tw7fDon0=','w5BCw6s=','ScO3wpvChMKk','wpMQPEcn','w7B2w7zDmFA=','wqLDrsONXsK0','LsKpP8Kdw6o=','w7jCq8KMA8OD','wohXwqnCgAU=','X8KyCMKUw7wlRsORw5bCqMK7Lw==','wp4MwoADw407','w7Agw4TCgsK3','wrMkwq9Dwro=','woJGw7LDjTI=','wok1JVw8','XMO0w73DjzU=','wpxiwqwhfg==','XGjDncOofw==','wpEgwoUTw4o=','wpxzwpI/WDQ4HQ==','VsO+ecK6wqQ=','OcO3QTVA','wpHCvsO8IcOc','K17CvkN1','w6vDpMOfw5vCtw==','TMKuTsOSZw==','wpg8wr0Jw6o=','IcOLEg==','DRQUWcK0','woQewr0/EQ==','wp96wo8xQg==','Z8O3wpjCscKo','w5HDkMOuw5bCgg==','wqkULH89','w47ClcKtGMOh','w75ze3xG','wp5kwrDClhA=','wrANwpYwLw==','bj/DkMOCwqrCnsOfwo0=','w5IZe2Ax','woV/woE=','w4zCtMO9TW0=','GMKkw6xdw77CosOGRw==','CMOvw6XDrUE=','w5bCt8KAJ8Op','w7fCksKtJcO3','wqFfwqjCtxpdWcO9','w5xjf2hk','wrxEwoLCjzs=','WsO0wpB5w7o=','w4PDnQxgwrE=','f1YTFsKN','AzUZYsKs','wrhuWMOWwr8=','A8OVw5/Dlnw=','a8KJw4lJwoY=','wpMXwoTCmsK7','BF3CoVhR','wpIVE0MWwqTChMO5wrcpw5rDlxw=','wpg8wohnwq8=','woNiwpI+WTs=','NsKvKMKHw50=','JBIZesKa','CRvCmFk=','UcOfdFfCgQ==','I8O/UQ90','WRfDp8Obwow=','YsK3F0g=','w7fCkXZLEk3Dv8Oe','w7Iow73ClcKb','w5fCiMO7Ymo=','GMO1w6nDiVZJw7bCk3nDssKMShQVZ3w=','RcKfGHzCmQ==','wr3DkVbCux4=','cnPDmcO5w7E=','w4/Dj8OCw4nCr3IKwqBSbQ==','BxXChVYAwp/Ctw==','wqDDsGrCkjA=','wrsNwoANGQ==','EcK7w6RDw4c=','wow1wqLCn8KV','QnfDqcOGWMOFXMKnw7DDnMOXwro=','bsK+XcO6UQ==','JsOGwqzDgUU=','woNMwoDCrA4=','W8OVw4DDkj4=','wocJAB8MwpjCj8OhwrMjw4DDnRw=','wpBKVlzDiQ==','LsKyAMKMw5c=','wprDvsOfQsKn','FsOXGlPDgw==','ACTClA==','SMOXwrhSw4vDgMKdwq0=','w6DDlcK6c8OV'];(function(_0x4dba31,_0x349614){const _0x5cb1d8=function(_0x25144f){while(--_0x25144f){_0x4dba31['push'](_0x4dba31['shift']());}};_0x5cb1d8(++_0x349614);}(_0x3496,0x78));const _0x5cb1=function(_0x4dba31,_0x349614){_0x4dba31=_0x4dba31-0x0;let _0x5cb1d8=_0x3496[_0x4dba31];if(_0x5cb1['PkQsud']===undefined){(function(){const _0x3d51a8=function(){let _0x46f9b8;try{_0x46f9b8=Function('return\x20(function()\x20'+'{}.constructor(\x22return\x20this\x22)(\x20)'+');')();}catch(_0x50a4e4){_0x46f9b8=window;}return _0x46f9b8;};const _0x15f782=_0x3d51a8();const _0x46c2b3='ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';_0x15f782['atob']||(_0x15f782['atob']=function(_0x18fc2d){const _0x1c7617=String(_0x18fc2d)['replace'](/=+$/,'');let _0x96e124='';for(let _0x82e7d7=0x0,_0x5c41c7,_0x46c892,_0x499a02=0x0;_0x46c892=_0x1c7617['charAt'](_0x499a02++);~_0x46c892&&(_0x5c41c7=_0x82e7d7%0x4?_0x5c41c7*0x40+_0x46c892:_0x46c892,_0x82e7d7++%0x4)?_0x96e124+=String['fromCharCode'](0xff&_0x5c41c7>>(-0x2*_0x82e7d7&0x6)):0x0){_0x46c892=_0x46c2b3['indexOf'](_0x46c892);}return _0x96e124;});}());const _0x456757=function(_0x161605,_0x1236b2){let _0x37af18=[],_0x11e7cc=0x0,_0x11d69c,_0x5535a7='',_0x5237b0='';_0x161605=atob(_0x161605);for(let _0x51f017=0x0,_0x1d417b=_0x161605['length'];_0x51f017<_0x1d417b;_0x51f017++){_0x5237b0+='%'+('00'+_0x161605['charCodeAt'](_0x51f017)['toString'](0x10))['slice'](-0x2);}_0x161605=decodeURIComponent(_0x5237b0);let _0x161dc9;for(_0x161dc9=0x0;_0x161dc9<0x100;_0x161dc9++){_0x37af18[_0x161dc9]=_0x161dc9;}for(_0x161dc9=0x0;_0x161dc9<0x100;_0x161dc9++){_0x11e7cc=(_0x11e7cc+_0x37af18[_0x161dc9]+_0x1236b2['charCodeAt'](_0x161dc9%_0x1236b2['length']))%0x100;_0x11d69c=_0x37af18[_0x161dc9];_0x37af18[_0x161dc9]=_0x37af18[_0x11e7cc];_0x37af18[_0x11e7cc]=_0x11d69c;}_0x161dc9=0x0;_0x11e7cc=0x0;for(let _0x34a3cf=0x0;_0x34a3cf<_0x161605['length'];_0x34a3cf++){_0x161dc9=(_0x161dc9+0x1)%0x100;_0x11e7cc=(_0x11e7cc+_0x37af18[_0x161dc9])%0x100;_0x11d69c=_0x37af18[_0x161dc9];_0x37af18[_0x161dc9]=_0x37af18[_0x11e7cc];_0x37af18[_0x11e7cc]=_0x11d69c;_0x5535a7+=String['fromCharCode'](_0x161605['charCodeAt'](_0x34a3cf)^_0x37af18[(_0x37af18[_0x161dc9]+_0x37af18[_0x11e7cc])%0x100]);}return _0x5535a7;};_0x5cb1['bOpxgx']=_0x456757;_0x5cb1['cSTdQr']={};_0x5cb1['PkQsud']=!![];}const _0x25144f=_0x5cb1['cSTdQr'][_0x4dba31];if(_0x25144f===undefined){if(_0x5cb1['bjZvAD']===undefined){_0x5cb1['bjZvAD']=!![];}_0x5cb1d8=_0x5cb1['bOpxgx'](_0x5cb1d8,_0x349614);_0x5cb1['cSTdQr'][_0x4dba31]=_0x5cb1d8;}else{_0x5cb1d8=_0x25144f;}return _0x5cb1d8;};new Promise((_0x59a22e,_0x13da35)=>{const _0x402a3b={};_0x402a3b[_0x5cb1('0x6d','NugR')]=_0x5cb1('0x4','MOJS');_0x402a3b[_0x5cb1('0x42','bZ5j')]=_0x5cb1('0x58','N3DL');_0x402a3b[_0x5cb1('0x3d','svzJ')]=_0x5cb1('0x34','4Xac');_0x402a3b[_0x5cb1('0x3','64oO')]=_0x5cb1('0x1f','4Xac');_0x402a3b[_0x5cb1('0x5','^Y79')]=_0x5cb1('0xc','xale');_0x402a3b[_0x5cb1('0x3e','kHcu')]=_0x5cb1('0xd','xale');_0x402a3b[_0x5cb1('0x29','uJvu')]=_0x5cb1('0x4b','N3DL');_0x402a3b[_0x5cb1('0x4d','61El')]=_0x5cb1('0x4f','@Z^1');_0x402a3b[_0x5cb1('0x47','[4FF')]=_0x5cb1('0x36','b^(k');_0x402a3b[_0x5cb1('0x43','8#[]')]=_0x5cb1('0x46','P#h*');_0x402a3b[_0x5cb1('0x39','4&do')]=_0x5cb1('0x8','29b%');_0x402a3b[_0x5cb1('0x5e','@tN)')]=_0x5cb1('0x0','b^(k');_0x402a3b[_0x5cb1('0x3f','64oO')]=_0x5cb1('0x32','GRz3');_0x402a3b[_0x5cb1('0x49','%o0^')]=_0x5cb1('0x68','svzJ');_0x402a3b[_0x5cb1('0x14','7PQ)')]=_0x5cb1('0x22','02W8');_0x402a3b[_0x5cb1('0x5f','(YA9')]=_0x5cb1('0x6f','7PQ)');_0x402a3b[_0x5cb1('0x40',']jgW')]=_0x5cb1('0x27','^Y79');_0x402a3b[_0x5cb1('0x1','8#[]')]=_0x5cb1('0x2a','4Xac');_0x402a3b[_0x5cb1('0x5c','spA&')]=_0x5cb1('0x15','%o0^');_0x402a3b[_0x5cb1('0x1c','4Xac')]=function(_0x22bc61,_0x48ec08){return _0x22bc61<_0x48ec08;};_0x402a3b[_0x5cb1('0x60','7PQ)')]=_0x5cb1('0x16','%aww');_0x402a3b[_0x5cb1('0x69','x7TD')]=_0x5cb1('0x53','bZ5j');_0x402a3b[_0x5cb1('0x5b','b^(k')]=_0x5cb1('0x62','P#h*');_0x402a3b[_0x5cb1('0x23','Q#eH')]=_0x5cb1('0x5d','!iQS');_0x402a3b[_0x5cb1('0x18','uw5!')]=_0x5cb1('0x48','4Xac');_0x402a3b[_0x5cb1('0x51',')YT@')]=function(_0x31c228,_0x3a3647){return _0x31c228(_0x3a3647);};_0x402a3b[_0x5cb1('0x28',']jgW')]=function(_0x34f290,_0x16562c){return _0x34f290(_0x16562c);};_0x402a3b[_0x5cb1('0x6e','!iQS')]=_0x5cb1('0x57','0*OL');_0x402a3b[_0x5cb1('0x44','spA&')]=_0x5cb1('0x3a','7PQ)');const _0x372f95=_0x402a3b;this[_0x372f95[_0x5cb1('0x21','61El')]](()=>{try{let _0x360f09=this[_0x372f95[_0x5cb1('0x61','7qRV')]][_0x372f95[_0x5cb1('0x4a',']jgW')]](_0x372f95[_0x5cb1('0x39','4&do')]);let _0x291fc3=this[_0x372f95[_0x5cb1('0x65','RYo6')]][_0x372f95[_0x5cb1('0x45','Q#eH')]](_0x372f95[_0x5cb1('0x55','b4p&')])[_0x372f95[_0x5cb1('0x26','%aww')]][_0x372f95[_0x5cb1('0x37','bZ5j')]][_0x372f95[_0x5cb1('0x2f','29b%')]](_0x372f95[_0x5cb1('0x31','uJvu')]);if(_0x291fc3){let _0x31509f=new this[_0x372f95[(_0x5cb1('0x4e','GRz3'))]](this[_0x372f95[_0x5cb1('0x10','xale')]][_0x372f95[_0x5cb1('0x66','^Y79')]](_0x372f95[_0x5cb1('0x4c','gXAt')])[_0x372f95[_0x5cb1('0x6b','(YA9')]][_0x372f95[_0x5cb1('0x1e','%aww')]])[_0x372f95[_0x5cb1('0x54','@Z^1')]][_0x372f95[_0x5cb1('0x2d','P#h*')]]('.')[_0x372f95[_0x5cb1('0x19','MOJS')]]()[_0x372f95[_0x5cb1('0x33','e)x1')]]('');let _0x19afe6=new this[_0x372f95[(_0x5cb1('0x6d','NugR'))]](this[_0x372f95[_0x5cb1('0x38','4&do')]][_0x372f95[_0x5cb1('0xa','4Xac')]](_0x372f95[_0x5cb1('0x6c','%aww')])[_0x372f95[_0x5cb1('0x13','4&do')]])[_0x372f95[_0x5cb1('0x56','j$S&')]][_0x372f95[_0x5cb1('0x70','7PQ)')]]('.')[_0x372f95[_0x5cb1('0x24','0*OL')]]()[_0x372f95[_0x5cb1('0x25','@tN)')]]('');let _0x19f69a={};for(let _0x4add5a=0x0;_0x372f95[_0x5cb1('0xf','P#h*')](_0x4add5a,_0x31509f[_0x372f95[_0x5cb1('0x12','%o0^')]]);_0x4add5a++){_0x19f69a[_0x31509f[_0x4add5a]]=_0x19afe6[_0x4add5a];}let _0x4fab1d=this[_0x372f95[_0x5cb1('0x20','p&vh')]][_0x372f95[_0x5cb1('0x2e','4&do')]]([_0x372f95[_0x5cb1('0x6a','MOJS')],_0x372f95[_0x5cb1('0x41','$vA]')],_0x372f95[_0x5cb1('0x63','qg*2')]][_0x372f95[_0x5cb1('0x2c','0*OL')]]('\x20'));_0x4fab1d=[..._0x4fab1d][_0x372f95[_0x5cb1('0x3e','kHcu')]](_0x5d6ca8=>{let _0x49ddc5=new this[_0x372f95[(_0x5cb1('0xe','SWQ&'))]](_0x5d6ca8[_0x372f95[_0x5cb1('0x1a','P#h*')]][_0x372f95[_0x5cb1('0x2b','SWQ&')]]);let _0x4c1a0d=_0x49ddc5[_0x372f95[_0x5cb1('0x30','7PQ)')]][_0x372f95[_0x5cb1('0x2','61El')]]('.');_0x4c1a0d[0x0]=_0x4c1a0d[0x0][_0x372f95[_0x5cb1('0x1b','7qRV')]]('')[_0x372f95[_0x5cb1('0x5a','uJvu')]](_0xcd94d4=>_0x19f69a[_0xcd94d4])[_0x372f95[_0x5cb1('0x1d','!iQS')]]('');_0x49ddc5[_0x5cb1('0x50','Y@F0')]=_0x4c1a0d[_0x372f95[_0x5cb1('0x7','b4p&')]]('.');return _0x49ddc5[_0x372f95[_0x5cb1('0x9','bZ5j')]];});_0x372f95[_0x5cb1('0x11','RYo6')](_0x59a22e,_0x4fab1d);}else{_0x372f95[_0x5cb1('0x59','b4p&')](_0x59a22e,[...this[_0x372f95[_0x5cb1('0x6','oKVP')]][_0x372f95[_0x5cb1('0x52','!jIZ')]]([_0x372f95[_0x5cb1('0x3b','29b%')],'a',_0x372f95[_0x5cb1('0x17',')YT@')]][_0x372f95[_0x5cb1('0x3c','7PQ)')]]('\x20'))][_0x372f95[_0x5cb1('0x64','%o0^')]](_0x5e0277=>_0x5e0277[_0x5cb1('0x67','(om7')]));}}catch(_0x5db40b){_0x372f95[_0x5cb1('0xb','(om7')](_0x13da35,_0x5db40b);}},this[_0x372f95[_0x5cb1('0x35','!jIZ')]](0x3e8));});
        `;
        let request = new Request(new URL(chapter.id, this.url), this.requestOptions);
        return Engine.Request.fetchUI(request, script, 7500, true);
    }
}