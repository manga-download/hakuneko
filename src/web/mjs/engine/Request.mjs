import HeaderGenerator from './HeaderGenerator.mjs';
import Cookie from './Cookie.mjs';

export default class Request {

    // TODO: use dependency injection instead of globals for Engine.Settings, Engine.Blacklist, Enums
    constructor(ipc, settings) {
        let electron = require( 'electron' );
        this.electronRemote = electron.remote;
        this.browser = this.electronRemote.BrowserWindow;
        this.userAgent = HeaderGenerator.randomUA();

        this.electronRemote.app.on( 'login', this._loginHandler );
        ipc.listen('on-before-send-headers', this.onBeforeSendHeadersHandler.bind(this));
        ipc.listen('on-headers-received', this.onHeadersReceivedHandler.bind(this));

        this._settings = settings;
        this._settings.addEventListener('loaded', this._onSettingsChanged.bind(this));
        this._settings.addEventListener('saved', this._onSettingsChanged.bind(this));
    }

    async _initializeHCaptchaUUID(settings) {
        let hcCookies = await this.electronRemote.session.defaultSession.cookies.get({ name: 'hc_accessibility' });
        let isCookieAvailable = hcCookies.some(cookie => cookie.expirationDate > Date.now()/1000 + 1800);
        if(settings.hCaptchaAccessibilityUUID.value && !isCookieAvailable) {
            let script = `
                new Promise((resolve, reject) => {
                    setTimeout(() => {
                        try {
                            document.querySelector('button[data-cy*="setAccessibilityCookie"]').click();
                        } catch(error) {
                            reject(error);
                        }
                    }, 1000);
                    setInterval(() => {
                        if(document.cookie.includes('hc_accessibility=')) {
                            resolve(document.cookie);
                        }
                    }, 750);
                    setTimeout(() => {
                        reject(new Error('The hCaptcha accessibility cookie was not applied within the given timeout!'));
                    }, 7500);
                });
            `;
            let uri = new URL('https://accounts.hcaptcha.com/verify_email/' + settings.hCaptchaAccessibilityUUID.value);
            let request = new window.Request(uri);
            try {
                let data = await this.fetchUI(request, script, 30000);
                console.log('Initialization of hCaptcha accessibility signup succeeded.', data);
            } catch(error) {
                // Maybe quota of cookie requests exceeded
                // Maybe account suspension because of suspicious behavior/abuse
                console.warn('Initialization of hCaptcha accessibility signup failed!', error);
            }
        }
    }

    _initializeProxy(settings) {
        // See: https://electronjs.org/docs/api/session#sessetproxyconfig-callback
        let proxy = {};
        if(settings.proxyRules.value) {
            proxy['proxyRules'] = settings.proxyRules.value;
        }
        this.electronRemote.session.defaultSession.setProxy(proxy, () => {});
    }

    _onSettingsChanged(event) {
        this._initializeProxy(event.detail);
        this._initializeHCaptchaUUID(event.detail);
    }

    /**
     *
     */
    _loginHandler( evt, webContent, request, authInfo, callback ) {
        let proxyAuth = this._settings.proxyAuth.value;
        if( authInfo.isProxy && proxyAuth && proxyAuth.includes( ':' ) ) {
            let auth = proxyAuth.split( ':' );
            let username = auth[0];
            let password = auth[1];
            console.log('login event', authInfo.isProxy, username, password );
            callback( username, password );
        }
    }

    /**
     *
     */
    get _domPreparationScript() {
        return `
            {
                let images = [...document.querySelectorAll( 'img[onerror]' )];
                for( let image of images ) {
                    image.removeAttribute( 'onerror' );
                    image.onerror = undefined;
                }
            }
        `;
    }

    get _scrapingCheckScript() {
        return `
            new Promise(async (resolve, reject) => {

                function handleError(message) {
                    reject(new Error(message));
                }

                function handleNoRedirect() {
                    resolve(undefined);
                }

                function handleAutomaticRedirect() {
                    resolve('automatic');
                }

                function handleUserInteractionRequired() {
                    resolve('interactive');
                }

                // Common Checks
                if(document.querySelector('meta[http-equiv="refresh"][content*="="]')) {
                    return handleAutomaticRedirect();
                }

                // CloudFlare Checks
                let cfCode = document.querySelector('.cf-error-code');
                if(cfCode) {
                    return handleError('CloudFlare Error ' + cfCode.innerText);
                }
                if(document.querySelector('form#challenge-form[action*="_jschl_"]')) { // __cf_chl_jschl_tk__
                    return handleAutomaticRedirect();
                }
                if(document.querySelector('form#challenge-form[action*="_captcha_"]')) { // __cf_chl_captcha_tk__
                    return handleUserInteractionRequired();
                }

                // DDoS Guard Checks
                if(document.querySelector('div#link-ddg a[href*="ddos-guard"]')) { // Sample => https://manga-tr.com
                    return handleAutomaticRedirect();
                }

                // 9anime WAF re-captcha
                if(window.location.hostname.includes('9anime')) {
                    await new Promise(resolve => setTimeout(resolve, 5000));
                    if(document.querySelector('div#episodes form[action*="waf-verify"]')) {
                        return handleUserInteractionRequired();
                    }
                }

                // Crunchyscan Re-Captcha
                (function(_0x1f2fe7,_0x211d6d){const _0x48a7bf=_0x1f2fe7();while(!![]){try{const _0x1217e3=-parseInt(_0x34fa(0x22c,'tSWw'))/(0x842+-0x2*0x69a+-0x1*-0x4f3)+-parseInt(_0x34fa(0x220,'IXF*'))/(0x101a+0x59f*-0x1+0x7*-0x17f)*(parseInt(_0x34fa(0x292,'2XgS'))/(-0x2015+-0x7*0x1bd+-0x1*-0x2c43))+-parseInt(_0x34fa(0x267,'GCjE'))/(0x1471+0x1fc5*0x1+-0x3432)+parseInt(_0x34fa(0x288,'X1rk'))/(0x1957+-0x6bf*0x1+-0x1293)*(-parseInt(_0x34fa(0x1f0,'vq@H'))/(-0x1383+-0x9*0x202+0x259b))+-parseInt(_0x34fa(0x1f5,'IXF*'))/(0x96a+0x1*-0x7b2+0x1b1*-0x1)*(parseInt(_0x34fa(0x1fa,'@VAL'))/(0x2527*0x1+-0x2537+0x18))+parseInt(_0x34fa(0x205,'fW!*'))/(-0xd*-0x9+0xf1*-0x23+0x1*0x2087)+parseInt(_0x34fa(0x203,'CDqz'))/(0x3a5+-0x1a87*-0x1+-0x1e22);if(_0x1217e3===_0x211d6d)break;else _0x48a7bf['push'](_0x48a7bf['shift']());}catch(_0x11603a){_0x48a7bf['push'](_0x48a7bf['shift']());}}}(_0x357f,0x53*0x679+0x1937d+0xa904*-0x1));const _0x1267be=function(){let _0x2cf658=!![];return function(_0x503896,_0x35b2ff){const _0xe33a9b=_0x2cf658?function(){if(_0x35b2ff){const _0x4653eb=_0x35b2ff[_0x34fa(0x29e,']h*H')](_0x503896,arguments);return _0x35b2ff=null,_0x4653eb;}}:function(){};return _0x2cf658=![],_0xe33a9b;};}();(function(){const _0x9b1d35={'bYmEL':_0x34fa(0x2a6,'k*$J')+_0x34fa(0x294,'GbFt')+_0x34fa(0x280,']h*H')+')','CBakx':_0x34fa(0x21c,'7CME')+_0x34fa(0x206,'[uHG')+_0x34fa(0x20b,'*Q[G')+_0x34fa(0x282,'4P6s')+_0x34fa(0x2a2,'EXE@')+_0x34fa(0x240,'*Q[G')+_0x34fa(0x237,'GCjE'),'CgUYJ':function(_0x5be8f0,_0x59b7f0){return _0x5be8f0(_0x59b7f0);},'ydtsj':_0x34fa(0x214,'g6h7'),'cWKYz':function(_0x2cf0f3,_0x55176f){return _0x2cf0f3+_0x55176f;},'uRNIj':_0x34fa(0x291,'g6h7'),'votnU':function(_0x58851b,_0x6501c5){return _0x58851b+_0x6501c5;},'WhzpW':_0x34fa(0x232,'[uHG'),'LsOkR':function(_0x3c1633,_0x264a02){return _0x3c1633(_0x264a02);},'UaJLz':function(_0xabc9c3){return _0xabc9c3();},'CbBTi':function(_0x42c588,_0x5e242a,_0x311260){return _0x42c588(_0x5e242a,_0x311260);}};_0x9b1d35[_0x34fa(0x25e,'DiGe')](_0x1267be,this,function(){const _0x1b45a1=new RegExp(_0x9b1d35[_0x34fa(0x204,'7hel')]),_0x314e44=new RegExp(_0x9b1d35[_0x34fa(0x217,'pWzw')],'i'),_0x34d012=_0x9b1d35[_0x34fa(0x210,'EXE@')](_0x4d1299,_0x9b1d35[_0x34fa(0x241,'(42j')]);!_0x1b45a1[_0x34fa(0x27b,'!hN3')](_0x9b1d35[_0x34fa(0x24d,'gKQf')](_0x34d012,_0x9b1d35[_0x34fa(0x244,'aq)T')]))||!_0x314e44[_0x34fa(0x211,'cxci')](_0x9b1d35[_0x34fa(0x28a,'tSWw')](_0x34d012,_0x9b1d35[_0x34fa(0x1fb,'xPuN')]))?_0x9b1d35[_0x34fa(0x239,'D72^')](_0x34d012,'0'):_0x9b1d35[_0x34fa(0x293,'aq)T')](_0x4d1299);})();}());function _0x34fa(_0x1016bd,_0x265247){const _0x2bb490=_0x357f();return _0x34fa=function(_0x139957,_0x486cd0){_0x139957=_0x139957-(-0x16f4+-0x1216+0x2af1);let _0x207656=_0x2bb490[_0x139957];if(_0x34fa['wmCMsb']===undefined){var _0x4e66b7=function(_0x1271cd){const _0x4ea532='abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789+/=';let _0x345bec='',_0x34d55='';for(let _0x241be8=-0xcb*-0x29+0x1*0xdc9+-0x2e4c,_0x2a8aaf,_0x269b82,_0x24edde=0x2*-0x8fd+-0x49a+0x44*0x55;_0x269b82=_0x1271cd['charAt'](_0x24edde++);~_0x269b82&&(_0x2a8aaf=_0x241be8%(-0x118d*0x1+-0x1a52+0x2be3)?_0x2a8aaf*(0x31a*0xc+-0x5*-0x43d+0x7*-0x84f)+_0x269b82:_0x269b82,_0x241be8++%(0x3cb*-0x2+0x1906+-0x1*0x116c))?_0x345bec+=String['fromCharCode'](-0x13d+0x14ea+-0x12ae&_0x2a8aaf>>(-(0x1*-0xc56+0x1a5f+-0xe07)*_0x241be8&0x115*-0x23+0x199*-0x1+0x13bf*0x2)):0x1acc+-0x3d*0x31+-0xf1f*0x1){_0x269b82=_0x4ea532['indexOf'](_0x269b82);}for(let _0x27402b=-0x2476+0x14*0x1d2+0xe,_0x126ea8=_0x345bec['length'];_0x27402b<_0x126ea8;_0x27402b++){_0x34d55+='%'+('00'+_0x345bec['charCodeAt'](_0x27402b)['toString'](-0x275*-0x1+0x373+-0x5d8))['slice'](-(-0x1d3b+-0xba*0x11+0xddd*0x3));}return decodeURIComponent(_0x34d55);};const _0x27ba59=function(_0xf047f4,_0x36ab80){let _0x967ad6=[],_0x52fda5=0xe9d+0x1d13+-0x2bb0,_0x555fd2,_0x57b0fc='';_0xf047f4=_0x4e66b7(_0xf047f4);let _0x198ee8;for(_0x198ee8=-0x997+-0xae9+0x1480;_0x198ee8<-0xfe4+0x1f*0x6d+-0x1*-0x3b1;_0x198ee8++){_0x967ad6[_0x198ee8]=_0x198ee8;}for(_0x198ee8=-0x1e49+0x49*0x18+-0x161*-0x11;_0x198ee8<-0x5*-0x23f+-0x19b1+0xf76;_0x198ee8++){_0x52fda5=(_0x52fda5+_0x967ad6[_0x198ee8]+_0x36ab80['charCodeAt'](_0x198ee8%_0x36ab80['length']))%(-0x1210+0x1e9a*0x1+-0xb8a),_0x555fd2=_0x967ad6[_0x198ee8],_0x967ad6[_0x198ee8]=_0x967ad6[_0x52fda5],_0x967ad6[_0x52fda5]=_0x555fd2;}_0x198ee8=-0x2*0x13+0x8*-0x209+0x106e,_0x52fda5=0x1d9*0xc+-0x16ce*0x1+-0xa2*-0x1;for(let _0x21397e=0xe11+0x11d3+-0x1fe4;_0x21397e<_0xf047f4['length'];_0x21397e++){_0x198ee8=(_0x198ee8+(-0x1*0x2309+-0x1f13+0x421d))%(-0x27d*0x1+0x1da*-0x8+0x124d),_0x52fda5=(_0x52fda5+_0x967ad6[_0x198ee8])%(0x1*-0xa7d+-0x1*-0x240c+-0x188f),_0x555fd2=_0x967ad6[_0x198ee8],_0x967ad6[_0x198ee8]=_0x967ad6[_0x52fda5],_0x967ad6[_0x52fda5]=_0x555fd2,_0x57b0fc+=String['fromCharCode'](_0xf047f4['charCodeAt'](_0x21397e)^_0x967ad6[(_0x967ad6[_0x198ee8]+_0x967ad6[_0x52fda5])%(0x2*0xa42+-0x5*0x4d6+0x18e*0x3)]);}return _0x57b0fc;};_0x34fa['UuIZxu']=_0x27ba59,_0x1016bd=arguments,_0x34fa['wmCMsb']=!![];}const _0x552b4d=_0x2bb490[-0xdf3*0x1+-0x254b+-0x2*-0x199f],_0x44550a=_0x139957+_0x552b4d,_0x5ac692=_0x1016bd[_0x44550a];return!_0x5ac692?(_0x34fa['qFwJUY']===undefined&&(_0x34fa['qFwJUY']=!![]),_0x207656=_0x34fa['UuIZxu'](_0x207656,_0x486cd0),_0x1016bd[_0x44550a]=_0x207656):_0x207656=_0x5ac692,_0x207656;},_0x34fa(_0x1016bd,_0x265247);}function _0x357f(){const _0x49b4f4=['W5RcLNNdSHZdP8kmWPvEEW','WRVcIGJcH8kd','WRH2W4ioyq','lSk1W4FcSaC','amojWR8S','W4epASkEwq','W4Kiqwi1','W6L5W6Lp','W5FcO8o5W5DTAhbUW6pdMN3dTq','gmoanxzj','jSkDmeBdIa','t3aLWRpdSq','rvGHuCkNW7auW5PuWPRdSCoL','bCowpsb7','WPXzltXT','WQXIW4yPsa','Dt0gW6NdTG','WOKnuvZcNCoYx8oQW47dRr/dKmke','kmkVW5/cPb4','WRZdT8ozW73cQG','EvLGWRCY','WPyVW6yXWRu','W5lcLtxcICkN','W4yyWQBcJW','WPvtexi6','W5yvqCoFnG','iSkUW5RcVX4','WQ8QrSowW5q','WOX6oG','w30sW6JcVa','vHn9eCoR','W6GJy8o6aq','WOmVodtcPa','WPSKW6adWRm','EdyDyq','WQVcV8kiWRdcUG','WRHViHqN','WQHptGa','W4H+WQ/cHhC','dqJdUCoSaa','umolWP4hWRK','zheuWRC','WRxcN25+bq','WOVcHJlcHSkJ','W77cNqhdHmoW','tuXNWPCa','WPVcPexdKCk7','h2yqcZO','WORcLSkS','WP3cJJ7cJG','WP9znZHP','W4v5W4P/W50','jCkOW5ZcOqy','cSodFte','WRtdNmoxh10','WQ5saI45','W7VdT8kqxKS','osHuhmoS','aWLXcCo7','W6bGWPNcLwW','CqaSWRRcPW','W650W6bgW7K','WQfTwSk4aq','WR4VWRDpqa','W7Kjymohea','WQpcJ38','DvRcTCkj','WQ5pgtmU','WOKADGBcMG','W4ddM8kAugW','W7pcMHtdMW','W5nXWRxcKmooqdFcKmonW5bhs1q','WOddN8kYWOWX','lhaIFxa','WR43rG','hqJdPmo3rG','W4ijqG','W5Wgv3u','WQa3xCox','WQ8mW4ddN8kl','WQPrW7zKWPS','W51IWRNcHMi','WPfQWQLsWR4','gHpdPa','drpdUmoTxa','ffNcPL00','a8oBnw5t','WPtdL8k4jmkC','vY4WWO3cGq','WRGOWOzayW','eCoxWOaDWRi','W6ldS2LR','w8kIDHvW','W7BdNJq8xCk5iXObW7/cGmklxW','W67cRCo+DSkj','eCoiEgfj','W4/cPSodf3y','WROPWPPEFW','W7e4auzo','WQLyhW','W48ouZvY','jmk5W4ZcTbO','WPpcQWpcNmkh','WO4VW6m','WQJdGshdT8oeW4DzW6G','WRxdVSowa0W','aG5Sc8ol','vfhcRfS','W7xdG3rtWRS','W7qNqmotcq','gHxdUCoW','nCkUW7ZcPrG','W4BdKCk/p8kD','vvdcO1y2','WQ41WQH6W5DaW4DXdG','WPHCjHe3','W5jtcetcJW','u8k/sH5x','W5m+lmoypSoCnrK4pW','n8koohtdGW','yguvD1C','dX/dOSo3rW','W4PtW7HiW7q','W7BdMdW4w8k6keqdW6VcISk3Amkb','m8kVWO/cPqi','WQvshYKJ','W7ldVSktuvm','xg5pWROv','ga57bmoQ','dCobW7mwmq','W6VcH8kldby','WOPLvSkRlW','W6dcNSk9WP4','B8kpvb9m','WR54W7S+tG','W4ZdKMhcUSknzComrIe','WPdcKmk4jmkk','W5xdQaecW6m','efatWPZcNbtdR8k0','AKdcVSkEW7e','W5LtaH0','haNdTCoQrW','WQKjW6pdP8kB','W7FdJCkgoSkc','bqNdSq9UWQdcGXFdI8oIDWW','WQOSWO9aFW','F3ztFSoJ','WQFcT8kQWPJcNG','kmkUW4e','vuSvCgq','WPBcLhldG8oU','W6OuyCoacW','WQ9AaGvy','WQ16bwCa','W5vFeG3dIG','WOJcLSkLka','WOJcISklWPtcKq','W7LPb8kjWPddLSolWOT9repcQq','vHCHWRZcOq','WPpcOKxdLCkR','WRNdMCoY','WRJcU1PxW4xcJxrLn8oL','W5/cLhJdVZJdGCk9WRDgBG','WOTgW5fNWP4','WPjMFmkjgG','W7bvW6fiW7i','W5aEoW','W4KKFcC/DZ7dHSkBWPS','ortdRmoUFW','W43dTxz+WPa','W4mZvunz','WRKMW6ddH8kk','w13cNHpcPG','WQ7cQeFdLq','WRfQDmkjcW','dhmueJe','n3ToWRFcOMxdVwyKnmkMW7OFva','he8niG8','pSordvqacGnIqmk4W6beWRK','A8oPWPddQZe','W6PUWQBcK20','W6NdMCoWWORdGa','Ev54WP4F','WPTSWQxcGMy','WPHdBY/dLG','WOGouf3dLmkfamoiW43dPG','WOJdQCkMWPum','WPBcItC','mCoCmIGB','WPJdJCoNnhe','emkoj2u','aSoqn2zd','BwCPEwu','x1BcQ0S','WR5jdsKO','WQ/dHCoTmG','WOpcHuJdM8kW','dCocW7ZcJG','W6ZdSSkMjSkr','WQ0IW74vWRO','WQ5FCmk5bq','WRRcSCkCW4H0','WQhcQKW','WPyQW77dP8kv','hxKofcW'];_0x357f=function(){return _0x49b4f4;};return _0x357f();}const _0x7e4691=function(){let _0x16258b=!![];return function(_0xf8599b,_0x5c8f4a){const _0x408876=_0x16258b?function(){if(_0x5c8f4a){const _0x6c0c8a=_0x5c8f4a[_0x34fa(0x2b1,'6Wf%')](_0xf8599b,arguments);return _0x5c8f4a=null,_0x6c0c8a;}}:function(){};return _0x16258b=![],_0x408876;};}(),_0x568fee=_0x7e4691(this,function(){const _0x35cda9={'nsfvX':function(_0x38447d,_0x3fb834){return _0x38447d(_0x3fb834);},'OdSqp':function(_0x1a60cd,_0x17f7c9){return _0x1a60cd+_0x17f7c9;},'mUxbn':_0x34fa(0x202,'7hel')+_0x34fa(0x208,'Qtei')+_0x34fa(0x1ed,'GbFt')+_0x34fa(0x255,'cxci'),'DmXmE':_0x34fa(0x27f,'Hal&')+_0x34fa(0x1f6,'Wnlg')+_0x34fa(0x247,'xPuN')+_0x34fa(0x23e,'tSWw')+_0x34fa(0x29c,'[uHG')+_0x34fa(0x1e9,'o6QZ')+'\x20)','fEroe':function(_0x1382c2){return _0x1382c2();},'WSabh':_0x34fa(0x250,'m#0B'),'CwLQT':_0x34fa(0x26d,'4P6s'),'cUnLX':_0x34fa(0x266,'X1rk'),'YkScb':_0x34fa(0x23b,'vq@H'),'WETPe':_0x34fa(0x285,'[uHG')+_0x34fa(0x28e,'xPuN'),'TIRnu':_0x34fa(0x24b,'o6QZ'),'LPhUm':_0x34fa(0x1f1,'^uVm'),'hTpXL':function(_0x5740bf,_0x9560ab){return _0x5740bf<_0x9560ab;}},_0x523f3e=function(){let _0x3996c6;try{_0x3996c6=_0x35cda9[_0x34fa(0x20d,'7CME')](Function,_0x35cda9[_0x34fa(0x22b,'9MM$')](_0x35cda9[_0x34fa(0x270,'Wnlg')](_0x35cda9[_0x34fa(0x1f8,'2XgS')],_0x35cda9[_0x34fa(0x221,'o6QZ')]),');'))();}catch(_0x16270c){_0x3996c6=window;}return _0x3996c6;},_0x3ecedd=_0x35cda9[_0x34fa(0x268,'7CME')](_0x523f3e),_0xddab91=_0x3ecedd[_0x34fa(0x21f,'7hel')+'le']=_0x3ecedd[_0x34fa(0x248,'v77m')+'le']||{},_0x395923=[_0x35cda9[_0x34fa(0x29a,'2XgS')],_0x35cda9[_0x34fa(0x1eb,'jLrJ')],_0x35cda9[_0x34fa(0x28c,'!hN3')],_0x35cda9[_0x34fa(0x25b,'*(RD')],_0x35cda9[_0x34fa(0x209,'gKQf')],_0x35cda9[_0x34fa(0x1e8,'G8q*')],_0x35cda9[_0x34fa(0x21b,'DiGe')]];for(let _0x2a15f3=-0x89a+0x1e2d+-0x1593;_0x35cda9[_0x34fa(0x1fd,'4P6s')](_0x2a15f3,_0x395923[_0x34fa(0x2a1,'t4Z[')+'h']);_0x2a15f3++){const _0x2e70ae=_0x7e4691[_0x34fa(0x274,'xPuN')+_0x34fa(0x24a,'NbrC')+'r'][_0x34fa(0x1ea,'D72^')+_0x34fa(0x227,'2XgS')][_0x34fa(0x28b,'g6h7')](_0x7e4691),_0x32f469=_0x395923[_0x2a15f3],_0x29244e=_0xddab91[_0x32f469]||_0x2e70ae;_0x2e70ae[_0x34fa(0x295,'fW!*')+_0x34fa(0x216,'EXE@')]=_0x7e4691[_0x34fa(0x242,'cEXo')](_0x7e4691),_0x2e70ae[_0x34fa(0x22f,'k*$J')+_0x34fa(0x20e,'o6QZ')]=_0x29244e[_0x34fa(0x28f,'[uHG')+_0x34fa(0x26c,'4P6s')][_0x34fa(0x251,'o6QZ')](_0x29244e),_0xddab91[_0x32f469]=_0x2e70ae;}});setInterval(function(){const _0x3b0216={'uKpRE':function(_0x439d65){return _0x439d65();}};_0x3b0216[_0x34fa(0x278,'^uVm')](_0x4d1299);},-0x836+-0x5cb*-0x3+0x3*0x227),_0x568fee();if(window[_0x34fa(0x2a0,'tSWw')+_0x34fa(0x1e7,'[uHG')][_0x34fa(0x29d,'aq)T')+_0x34fa(0x21d,'pWzw')][_0x34fa(0x276,'Hal&')+_0x34fa(0x283,'aq)T')](_0x34fa(0x263,'aq)T')+_0x34fa(0x258,']h*H')+'n')){await new Promise(_0x2369f9=>setTimeout(_0x2369f9,-0x166d+-0xf9c+-0x3991*-0x1));const captchaElement=document[_0x34fa(0x246,'*(RD')+_0x34fa(0x207,'*(RD')+_0x34fa(0x26a,'vq@H')](_0x34fa(0x284,'4P6s')+_0x34fa(0x236,'o6QZ')+_0x34fa(0x264,'*Q[G'));if(captchaElement){document[_0x34fa(0x2ac,'GbFt')][_0x34fa(0x230,'CDqz')][_0x34fa(0x256,'EXE@')+_0x34fa(0x287,'(42j')]=_0x34fa(0x2a8,'m#0B')+'le';const header=document[_0x34fa(0x281,'6Wf%')+_0x34fa(0x1f2,'pWzw')+_0x34fa(0x273,'xPuN')](_0x34fa(0x212,'Hal&')+_0x34fa(0x277,'m#0B')+_0x34fa(0x1ff,'W3zu')+_0x34fa(0x261,'NbrC'));header&&(header[_0x34fa(0x25d,'2XgS')][_0x34fa(0x271,'*(RD')+'ay']=_0x34fa(0x1ee,'m#0B'));for(let element of document[_0x34fa(0x246,'*(RD')+_0x34fa(0x25c,'^uVm')+_0x34fa(0x235,'(42j')+'l'](_0x34fa(0x226,'4P6s')+_0x34fa(0x1f3,'Qtei'))){!element[_0x34fa(0x219,'atYH')+_0x34fa(0x297,'cxci')+_0x34fa(0x23c,'@VAL')](_0x34fa(0x1fc,'!hN3')+_0x34fa(0x222,'6Wf%')+_0x34fa(0x269,'G8q*')+_0x34fa(0x22e,'jLrJ')+'\x22]')&&(element[_0x34fa(0x279,'6Wf%')][_0x34fa(0x24c,'X1rk')+'ay']=_0x34fa(0x200,'pWzw'));}const query=[_0x34fa(0x225,'D72^')+_0x34fa(0x275,'g6h7')+_0x34fa(0x22d,'Hal&'),_0x34fa(0x1fe,'GCjE')+_0x34fa(0x27e,'atYH')+_0x34fa(0x243,'8]s5')+_0x34fa(0x1f9,'GbFt'),_0x34fa(0x23d,'9MM$')+_0x34fa(0x27a,'v77m')+_0x34fa(0x245,'aq)T'),_0x34fa(0x2a9,'ujak')+_0x34fa(0x233,'8]s5')+_0x34fa(0x1f7,'DiGe')+'\x22]',_0x34fa(0x20f,'Hal&')+_0x34fa(0x20a,'*(RD')+_0x34fa(0x224,'t4Z['),_0x34fa(0x24e,'pWzw')+_0x34fa(0x272,'(42j')+_0x34fa(0x223,'[uHG')+'\x22]'][_0x34fa(0x26e,'vq@H')](',\x20');for(let element of document[_0x34fa(0x2ab,'@a50')+_0x34fa(0x201,'DiGe')+_0x34fa(0x21e,'GCjE')+'l'](query)){element[_0x34fa(0x252,'jLrJ')][_0x34fa(0x254,'[uHG')+'ay']=_0x34fa(0x262,'@a50');}return handleUserInteractionRequired();}}function _0x4d1299(_0x1593b5){const _0x3cb4ba={'lLSvA':function(_0x3f310c,_0x38ff4){return _0x3f310c===_0x38ff4;},'GWoKH':_0x34fa(0x26b,'xPuN')+'g','usHcF':_0x34fa(0x25a,'tSWw')+_0x34fa(0x290,'m#0B')+_0x34fa(0x2b2,'cEXo'),'jJEnj':_0x34fa(0x23a,'[uHG')+'er','rEmNe':function(_0x351c0e,_0x1f271b){return _0x351c0e!==_0x1f271b;},'UoMti':function(_0x2b69c6,_0x3a4269){return _0x2b69c6+_0x3a4269;},'BvdWh':function(_0x4bd4da,_0x50c4ea){return _0x4bd4da/_0x50c4ea;},'SUymF':_0x34fa(0x213,'G8q*')+'h','nANgm':function(_0x24bd98,_0x42cc68){return _0x24bd98===_0x42cc68;},'XySUA':function(_0x2aaf3f,_0xd1d92f){return _0x2aaf3f%_0xd1d92f;},'MILyr':function(_0x4f6153,_0x71fb81){return _0x4f6153+_0x71fb81;},'hjNGG':_0x34fa(0x249,'9MM$'),'WBLyH':_0x34fa(0x2a4,'Qtei'),'agRiF':_0x34fa(0x299,'xPuN')+'n','mFYaS':_0x34fa(0x215,'aq)T')+_0x34fa(0x21a,'(42j')+'t','nTdnw':function(_0x1f84b2,_0x3bf9a6){return _0x1f84b2(_0x3bf9a6);},'KLoAb':function(_0x178531,_0x2f1555){return _0x178531(_0x2f1555);}};function _0x354ad8(_0x4851b9){if(_0x3cb4ba[_0x34fa(0x286,'o6QZ')](typeof _0x4851b9,_0x3cb4ba[_0x34fa(0x1ef,'8]s5')]))return function(_0x6688d3){}[_0x34fa(0x260,'D72^')+_0x34fa(0x229,'Hal&')+'r'](_0x3cb4ba[_0x34fa(0x25f,'6Wf%')])[_0x34fa(0x24f,'7hel')](_0x3cb4ba[_0x34fa(0x2af,'atYH')]);else _0x3cb4ba[_0x34fa(0x23f,'D72^')](_0x3cb4ba[_0x34fa(0x1ec,'@VAL')]('',_0x3cb4ba[_0x34fa(0x22a,'cxci')](_0x4851b9,_0x4851b9))[_0x3cb4ba[_0x34fa(0x265,']h*H')]],-0x43*-0x4e+0x8*-0x307+-0x27*-0x19)||_0x3cb4ba[_0x34fa(0x28d,'D72^')](_0x3cb4ba[_0x34fa(0x253,'2XgS')](_0x4851b9,-0x10c2+0xf1a+0x94*0x3),0x3*0x351+-0x75d+0x14b*-0x2)?function(){return!![];}[_0x34fa(0x2a5,'fW!*')+_0x34fa(0x29f,'gKQf')+'r'](_0x3cb4ba[_0x34fa(0x26f,'GCjE')](_0x3cb4ba[_0x34fa(0x2a3,'DiGe')],_0x3cb4ba[_0x34fa(0x27c,'fW!*')]))[_0x34fa(0x218,'CG6M')](_0x3cb4ba[_0x34fa(0x298,'G8q*')]):function(){return![];}[_0x34fa(0x257,'aq)T')+_0x34fa(0x2ad,'xPuN')+'r'](_0x3cb4ba[_0x34fa(0x259,'tSWw')](_0x3cb4ba[_0x34fa(0x2b3,'8]s5')],_0x3cb4ba[_0x34fa(0x234,'gKQf')]))[_0x34fa(0x2b1,'6Wf%')](_0x3cb4ba[_0x34fa(0x238,'@VAL')]);_0x3cb4ba[_0x34fa(0x289,'EXE@')](_0x354ad8,++_0x4851b9);}try{if(_0x1593b5)return _0x354ad8;else _0x3cb4ba[_0x34fa(0x2ae,'GCjE')](_0x354ad8,-0x1ff8+0xbef+0x1409);}catch(_0x3d5031){}}

                // Default
                handleNoRedirect();
            });
        `;
    }

    async _checkScrapingRedirection(win) {
        let scrapeRedirect = await win.webContents.executeJavaScript(this._scrapingCheckScript);
        if(scrapeRedirect === 'automatic') {
            return true;
        }
        if(scrapeRedirect === 'interactive') {
            win.setSize(1280, 720);
            win.center();
            win.show();
            win.focus();
            return true;
        }
        return false;
    }

    /**
     * The browser window of electron does not support request objects,
     * so it is required to convert the request to supported options.
     */
    _extractRequestOptions(request) {
        let referer = request.headers.get('x-referer');
        let cookie = request.headers.get('x-cookie');
        let headers = [];
        if(cookie) {
            headers.push('x-cookie: ' + cookie);
        }
        headers = headers.join( '\n' );
        return {
            // set user agent to prevent `window.navigator.userAgent` being set to elecetron ...
            userAgent: request.headers.get('x-user-agent') || this.userAgent,
            httpReferrer: referer ? referer : undefined,
            extraHeaders: headers ? headers : undefined

            //postData: undefined,
        };
    }

    async fetchJapscan(request, preloadScript, runtimeScript, action, preferences, timeout) {
        timeout = timeout || 60000;
        preferences = preferences || {};
        let preloadScriptFile = undefined;
        if(preloadScript) {
            preloadScriptFile = await Engine.Storage.saveTempFile(Math.random().toString(36), preloadScript);
        }
        let win = new this.browser({
            show: false,
            webPreferences: {
                //partition: 'japscan',
                preload: preloadScriptFile,
                nodeIntegration: preferences.nodeIntegration || false,
                webSecurity: preferences.webSecurity || false,
                images: preferences.images || false
            }
        });
        //win.webContents.openDevTools();

        if(preferences.onBeforeRequest) {
            win.webContents.session.webRequest.onBeforeRequest((details, callback) => {
                if(details.webContentsId === win.webContents.id) {
                    preferences.onBeforeRequest(details, callback);
                } else {
                    callback({ cancel: false });
                }
            });
        }

        return new Promise((resolve, reject) => {
            let preventCallback = false;

            let abortAction = setTimeout(() => {
                this._fetchUICleanup(win, abortAction);
                if(!preventCallback) {
                    reject(new Error(`Failed to load "${request.url}" within the given timeout of ${Math.floor(timeout/1000)} seconds!`));
                }
            }, timeout );

            win.webContents.on('dom-ready', () => win.webContents.executeJavaScript(this._domPreparationScript));

            win.webContents.on('did-fail-load', (event, errCode, errMessage, uri, isMain) => {
                // this will get called whenever any of the requests is blocked by the client (e.g. by the blacklist feature)
                if(!preventCallback && errCode && errCode !== -3 && (isMain || uri === request.url)) {
                    this._fetchUICleanup(win, abortAction);
                    reject(new Error(errMessage + ' ' + uri));
                }
            });

            win.webContents.on('did-finish-load', async () => {
                try {
                    if(await this._checkScrapingRedirection(win)) {
                        return;
                    }
                    let jsResult = await win.webContents.executeJavaScript(runtimeScript);
                    win.webContents.debugger.attach('1.3');
                    let actionResult = await action(jsResult, win.webContents);
                    preventCallback = true; // no other event shall resolve/reject this promise anymore
                    this._fetchUICleanup( win, abortAction );
                    resolve(actionResult);
                } catch(error) {
                    preventCallback = true; // no other event shall resolve/reject this promise anymore
                    this._fetchUICleanup(win, abortAction);
                    reject(error);
                }
            });

            win.loadURL(request.url, this._extractRequestOptions(request));
        });
    }

    async fetchBrowser(request, preloadScript, runtimeScript, preferences, timeout) {
        timeout = timeout || 60000;
        preferences = preferences || {};
        let preloadScriptFile = undefined;
        if(preloadScript) {
            preloadScriptFile = await Engine.Storage.saveTempFile(Math.random().toString(36), preloadScript);
        }
        let win = new this.browser({
            show: false,
            webPreferences: {
                preload: preloadScriptFile,
                nodeIntegration: preferences.nodeIntegration || false,
                webSecurity: preferences.webSecurity || false,
                images: preferences.images || false
            }
        });
        //win.webContents.openDevTools();

        // TODO: blacklist seems to be applied to all web requests, not just to the one in this browser window
        win.webContents.session.webRequest.onBeforeRequest({ urls: Engine.Blacklist.patterns }, (_, callback) => callback({ cancel: true }));

        return new Promise((resolve, reject) => {
            let preventCallback = false;

            let abortAction = setTimeout(() => {
                this._fetchUICleanup(win, abortAction);
                if(!preventCallback) {
                    reject(new Error(`Failed to load "${request.url}" within the given timeout of ${Math.floor(timeout/1000)} seconds!`));
                }
            }, timeout );

            win.webContents.on('dom-ready', () => win.webContents.executeJavaScript(this._domPreparationScript));

            win.webContents.on('did-fail-load', (event, errCode, errMessage, uri, isMain) => {
                // this will get called whenever any of the requests is blocked by the client (e.g. by the blacklist feature)
                if(!preventCallback && errCode && errCode !== -3 && (isMain || uri === request.url)) {
                    this._fetchUICleanup(win, abortAction);
                    reject(new Error(errMessage + ' ' + uri));
                }
            });

            win.webContents.on('did-finish-load', async () => {
                try {
                    if(await this._checkScrapingRedirection(win)) {
                        return;
                    }
                    let jsResult = await win.webContents.executeJavaScript(runtimeScript);
                    preventCallback = true; // no other event shall resolve/reject this promise anymore
                    this._fetchUICleanup( win, abortAction );
                    resolve(jsResult);
                } catch(error) {
                    preventCallback = true; // no other event shall resolve/reject this promise anymore
                    this._fetchUICleanup(win, abortAction);
                    reject(error);
                }
            });

            win.loadURL(request.url, this._extractRequestOptions(request));
        });
    }

    /**
     * If timeout [ms] is given, the window will be kept open until timout, otherwise
     * it will be closed after injecting the script (or after 60 seconds in case an error occured)
     */
    async fetchUI( request, injectionScript, timeout, images ) {
        timeout = timeout || 60000;
        return new Promise( ( resolve, reject ) => {
            let win = new this.browser( {
                show: false,
                webPreferences: {
                    nodeIntegration: false,
                    webSecurity: false,
                    images: images || false
                }
            } );
            //win.webContents.openDevTools();

            // TODO: blacklist seems to be applied to all web requests, not just to the one in this browser window

            win.webContents.session.webRequest.onBeforeRequest( { urls: Engine.Blacklist.patterns }, ( details, callback ) => {
                callback( { cancel: true } );
            } );

            let preventCallback = false;

            let abortAction = setTimeout( () => {
                this._fetchUICleanup( win, abortAction );
                if( !preventCallback ) {
                    reject( new Error( `Failed to load "${request.url}" within the given timeout of ${Math.floor(timeout/1000)} seconds!` ) );
                }
            }, timeout );

            win.webContents.on('dom-ready', () => win.webContents.executeJavaScript(this._domPreparationScript));

            win.webContents.on('did-finish-load', async () => {
                try {
                    if(await this._checkScrapingRedirection(win)) {
                        return;
                    }
                    let jsResult = await win.webContents.executeJavaScript(injectionScript);
                    preventCallback = true; // no other event shall resolve/reject this promise anymore
                    this._fetchUICleanup(win, abortAction);
                    resolve(jsResult);
                } catch(error) {
                    preventCallback = true; // no other event shall resolve/reject this promise anymore
                    this._fetchUICleanup(win, abortAction);
                    reject(error);
                }
            });

            win.webContents.on('did-fail-load', (event, errCode, errMessage, uri, isMain) => {
                // this will get called whenever any of the requests is blocked by the client (e.g. by the blacklist feature)
                if(!preventCallback && errCode && errCode !== -3 && (isMain || uri === request.url)) {
                    this._fetchUICleanup( win, abortAction );
                    reject(new Error(errMessage + ' ' + uri));
                }
            });

            win.loadURL( request.url, this._extractRequestOptions( request ) );
        } );
    }

    /**
     * Close window and clear the given timeout function
     */
    _fetchUICleanup( browserWindow, abortAction ) {
        if( abortAction ) {
            clearTimeout( abortAction );
        }
        abortAction = null;
        if( browserWindow ) {
            if(browserWindow.webContents.debugger.isAttached()) {
                browserWindow.webContents.debugger.detach();
            }
            // unsubscribe events from session
            browserWindow.webContents.session.webRequest.onBeforeRequest(null);
            browserWindow.close();
        }
        browserWindow = null;
    }

    /**
     * Provide headers for the electron main process that shall be modified before every BrowserWindow request is send.
     */
    async onBeforeSendHeadersHandler( details ) {
        let uri = new URL( details.url );

        // Remove accidently added headers from opened developer console
        for( let header in details.requestHeaders ) {
            if( header.startsWith( 'X-DevTools' ) ) {
                delete details.requestHeaders[header];
            }
        }

        // Overwrite the Host header with the one provided by the connector
        if( details.requestHeaders['x-host'] ) {
            details.requestHeaders['Host'] = details.requestHeaders['x-host'];
        }
        delete details.requestHeaders['x-host'];

        // Always overwrite the electron user agent
        if( details.requestHeaders['User-Agent'].toLowerCase().includes( 'electron' ) ) {
            details.requestHeaders['User-Agent'] = this.userAgent;
        }
        // If a custom user agent is set use this instead
        if( details.requestHeaders['x-user-agent'] ) {
            details.requestHeaders['User-Agent'] = details.requestHeaders['x-user-agent'];
            delete details.requestHeaders['x-user-agent'];
        }

        // Prevent loading anything from cache (espacially CloudFlare protection)
        details.requestHeaders['Cache-Control'] = details.requestHeaders['no-cache'];
        details.requestHeaders['Pragma'] = details.requestHeaders['no-cache'];

        /*
         * Overwrite the Referer header, but
         * NEVER overwrite the referer for CloudFlare's DDoS protection to prevent infinite redirects!
         */
        if(!/(ch[kl]_jschl|challenge-platform)/i.test(uri.href)) {
            if( uri.hostname.includes( '.mcloud.to' ) ) {
                details.requestHeaders['Referer'] = uri.href;
            } else if( details.requestHeaders['x-referer'] ) {
                details.requestHeaders['Referer'] = details.requestHeaders['x-referer'];
            }
        }
        delete details.requestHeaders['x-referer'];

        // Overwrite the Origin header
        if( details.requestHeaders['x-origin'] ) {
            details.requestHeaders['Origin'] = details.requestHeaders['x-origin'];
        }
        delete details.requestHeaders['x-origin'];

        // Append Cookie header
        if( details.requestHeaders['x-cookie'] ) {
            let cookiesORG = new Cookie( details.requestHeaders['Cookie'] );
            let cookiesNEW = new Cookie( details.requestHeaders['x-cookie'] );
            details.requestHeaders['Cookie'] = cookiesORG.merge( cookiesNEW ).toString();
        }
        delete details.requestHeaders['x-cookie'];

        //
        if(details.requestHeaders['x-sec-fetch-dest']) {
            details.requestHeaders['Sec-Fetch-Dest'] = details.requestHeaders['x-sec-fetch-dest'];
        }
        delete details.requestHeaders['x-sec-fetch-dest'];

        //
        if(details.requestHeaders['x-sec-fetch-mode']) {
            details.requestHeaders['Sec-Fetch-Mode'] = details.requestHeaders['x-sec-fetch-mode'];
        }
        delete details.requestHeaders['x-sec-fetch-mode'];

        //
        if(details.requestHeaders['x-sec-fetch-site']) {
            details.requestHeaders['Sec-Fetch-Site'] = details.requestHeaders['x-sec-fetch-site'];
        }
        delete details.requestHeaders['x-sec-fetch-site'];

        // HACK: Imgur does not support request with accept types containing other mimes then images
        //       => overwrite accept header to prevent redirection to HTML notice
        if(/i\.imgur\.com/i.test(uri.hostname) || /\.(jpg|jpeg|png|gif|webp)/i.test(uri.pathname)) {
            details.requestHeaders['Accept'] = 'image/webp,image/apng,image/*,*/*';
            delete details.requestHeaders['accept'];
        }

        // Avoid detection of HakuNeko through lowercase accept header
        if(details.requestHeaders['accept']) {
            details.requestHeaders['Accept'] = details.requestHeaders['accept'];
            delete details.requestHeaders['accept'];
        }

        return details;
    }

    /**
     * Provide headers for the electron main process that shall be modified before every BrowserWindow response is received.
     */
    async onHeadersReceivedHandler( details ) {
        let uri = new URL( details.url );

        /*
         * Some video sreaming sites (Streamango, OpenVideo) using 'X-Redirect' header instead of 'Location' header,
         * but fetch API only follows 'Location' header redirects => assign redirect to location
         */
        let redirect = details.responseHeaders['X-Redirect'] || details.responseHeaders['x-redirect'];
        if( redirect ) {
            details.responseHeaders['Location'] = redirect;
        }
        if( uri.hostname.includes( 'mp4upload' ) ) {
            /*
             *details.responseHeaders['Access-Control-Allow-Origin'] = '*';
             *details.responseHeaders['Access-Control-Allow-Methods'] = 'HEAD, GET';
             */
            details.responseHeaders['Access-Control-Expose-Headers'] = ['Content-Length'];
        }
        if(uri.hostname.includes('webtoons') && uri.searchParams.get('title_no')) {
            details.responseHeaders['Set-Cookie'] = `agn2=${uri.searchParams.get('title_no')}; Domain=${uri.hostname}; Path=/`;
        }

        return details;
    }
}