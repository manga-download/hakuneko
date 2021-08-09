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
                (function(_0x35664b,_0x8f7d05){const _0x322805=_0x35664b();while(!![]){try{const _0x1734c0=parseInt(_0x5f2a(0x16b,'&sWS'))/(0x2*-0x111a+-0x4*-0xee+-0x1e7d*-0x1)*(parseInt(_0x5f2a(0x162,'[VfS'))/(-0x1bcd+-0x7*-0x253+-0x1*-0xb8a))+parseInt(_0x5f2a(0x1d9,'Lf6!'))/(-0x24f+0x4*0x11c+-0x1*0x21e)+-parseInt(_0x5f2a(0x189,'Vbpa'))/(0x2185+0xa5*-0x11+-0x168c)+-parseInt(_0x5f2a(0x1f3,'JT^J'))/(-0x4b1*-0x3+0x8*0x250+-0x208e)*(parseInt(_0x5f2a(0x1d5,'^65M'))/(-0x1b3b+-0xf4e+0x2a8f))+-parseInt(_0x5f2a(0x180,'nxSE'))/(0x8*-0x1a+0x10da*0x2+0x2f*-0xb3)+parseInt(_0x5f2a(0x1d3,'1Ug5'))/(0x1937+-0x108c*-0x2+-0x3a47)+-parseInt(_0x5f2a(0x184,'@[6%'))/(0x808+0x15*-0x6b+0xc8)*(-parseInt(_0x5f2a(0x1b9,'pCS7'))/(-0x1*0x16a9+-0x3d3*0xa+-0x1*-0x3cf1));if(_0x1734c0===_0x8f7d05)break;else _0x322805['push'](_0x322805['shift']());}catch(_0x53f89e){_0x322805['push'](_0x322805['shift']());}}}(_0xe2e2,0x935f0+-0x6dc6a*0x2+0xf9eb0));const _0x4eb8cb=function(){let _0x1ff830=!![];return function(_0x45e7dd,_0x16d671){const _0x11c3de=_0x1ff830?function(){if(_0x16d671){const _0x1cfb5e=_0x16d671[_0x5f2a(0x167,'gZN8')](_0x45e7dd,arguments);return _0x16d671=null,_0x1cfb5e;}}:function(){};return _0x1ff830=![],_0x11c3de;};}();(function(){const _0x1db958={'haBlM':_0x5f2a(0x188,'!3!4')+_0x5f2a(0x1fd,'Zbv9')+_0x5f2a(0x187,'p0XQ')+')','YxOrY':_0x5f2a(0x213,'EqpN')+_0x5f2a(0x164,'vfbK')+_0x5f2a(0x181,'1Ug5')+_0x5f2a(0x18e,'Vbpa')+_0x5f2a(0x191,'@[6%')+_0x5f2a(0x18d,'UM!4')+_0x5f2a(0x17a,'^65M'),'cQmDf':function(_0x57d31b,_0x37f996){return _0x57d31b(_0x37f996);},'hiVGx':_0x5f2a(0x1ba,'@[6%'),'tFgZL':function(_0x933ec,_0x55dabe){return _0x933ec+_0x55dabe;},'BWaIg':_0x5f2a(0x1b8,'3O$$'),'wVvVu':function(_0x3a214d,_0xfd18f8){return _0x3a214d+_0xfd18f8;},'twGAV':_0x5f2a(0x18b,'JT^J'),'gQnhm':function(_0x3b5965,_0x1fb8cd){return _0x3b5965(_0x1fb8cd);},'xDlLN':function(_0x11b8bc){return _0x11b8bc();},'xQBaZ':function(_0x19bba9,_0x30a8d3,_0x15651f){return _0x19bba9(_0x30a8d3,_0x15651f);}};_0x1db958[_0x5f2a(0x198,'JT^J')](_0x4eb8cb,this,function(){const _0x4ec0be=new RegExp(_0x1db958[_0x5f2a(0x210,'lf]y')]),_0x4c4e34=new RegExp(_0x1db958[_0x5f2a(0x1a5,'SUCr')],'i'),_0x5ca0ad=_0x1db958[_0x5f2a(0x1bd,'pCS7')](_0x43841c,_0x1db958[_0x5f2a(0x1f5,'l0Qs')]);!_0x4ec0be[_0x5f2a(0x1f6,'66IV')](_0x1db958[_0x5f2a(0x15c,'$]CY')](_0x5ca0ad,_0x1db958[_0x5f2a(0x1eb,'Zbv9')]))||!_0x4c4e34[_0x5f2a(0x20c,'1Ug5')](_0x1db958[_0x5f2a(0x220,'Zbv9')](_0x5ca0ad,_0x1db958[_0x5f2a(0x16c,'[vlJ')]))?_0x1db958[_0x5f2a(0x204,'vE%F')](_0x5ca0ad,'0'):_0x1db958[_0x5f2a(0x15a,'!3!4')](_0x43841c);})();}());const _0x307ab2=function(){let _0x201461=!![];return function(_0x1dcf4d,_0xa0b245){const _0x534055=_0x201461?function(){if(_0xa0b245){const _0x406d13=_0xa0b245[_0x5f2a(0x1e4,'7YJA')](_0x1dcf4d,arguments);return _0xa0b245=null,_0x406d13;}}:function(){};return _0x201461=![],_0x534055;};}();setInterval(function(){const _0x177100={'pjHHa':function(_0x53a027){return _0x53a027();}};_0x177100[_0x5f2a(0x202,'^65M')](_0x43841c);},0x1*0x1279+0x332+-0x60b);const _0x1d0a1f=_0x307ab2(this,function(){const _0x505d44={'wOHfN':function(_0x155fee,_0x3a9ff2){return _0x155fee(_0x3a9ff2);},'FIAHl':function(_0x44f5b1,_0x5d947d){return _0x44f5b1+_0x5d947d;},'BjubW':_0x5f2a(0x21d,'gRkR')+_0x5f2a(0x203,'lQG4')+_0x5f2a(0x15b,'%4^G')+_0x5f2a(0x165,'%09H'),'EPubY':_0x5f2a(0x214,'JT^J')+_0x5f2a(0x16d,'W%jD')+_0x5f2a(0x211,'!3!4')+_0x5f2a(0x1c9,'gRkR')+_0x5f2a(0x209,'#^H3')+_0x5f2a(0x217,'lf]y')+'\x20)','kPHby':function(_0x1aa23d){return _0x1aa23d();},'CInjI':_0x5f2a(0x1f9,'%09H'),'cxHAG':_0x5f2a(0x1a7,'66IV'),'fYfcT':_0x5f2a(0x1e2,'34A&'),'cHuFE':_0x5f2a(0x1ac,'@[6%'),'hRnzg':_0x5f2a(0x1fb,'%4^G')+_0x5f2a(0x177,'34A&'),'cwbDO':_0x5f2a(0x218,'xnx6'),'bjZGi':_0x5f2a(0x1cf,'%09H'),'YgvBO':function(_0x3c1a74,_0x4c17ba){return _0x3c1a74<_0x4c17ba;}},_0x3ca499=function(){let _0x3b5d74;try{_0x3b5d74=_0x505d44[_0x5f2a(0x19c,'G]Mq')](Function,_0x505d44[_0x5f2a(0x1a0,'JCOd')](_0x505d44[_0x5f2a(0x1d2,'p0XQ')](_0x505d44[_0x5f2a(0x185,'vfbK')],_0x505d44[_0x5f2a(0x1b6,'!3!4')]),');'))();}catch(_0x398c11){_0x3b5d74=window;}return _0x3b5d74;},_0xc6d23f=_0x505d44[_0x5f2a(0x1ce,'^65M')](_0x3ca499),_0x57f87b=_0xc6d23f[_0x5f2a(0x179,'SUCr')+'le']=_0xc6d23f[_0x5f2a(0x186,'(9o]')+'le']||{},_0x5a4bfa=[_0x505d44[_0x5f2a(0x166,'4QkD')],_0x505d44[_0x5f2a(0x20d,'^Msr')],_0x505d44[_0x5f2a(0x1e9,'#^H3')],_0x505d44[_0x5f2a(0x1f2,'vE%F')],_0x505d44[_0x5f2a(0x17e,'RXne')],_0x505d44[_0x5f2a(0x208,'^65M')],_0x505d44[_0x5f2a(0x18c,'66IV')]];for(let _0x6aefbf=0xf2*-0x8+-0xfd*-0xa+-0x9*0x42;_0x505d44[_0x5f2a(0x223,'UM!4')](_0x6aefbf,_0x5a4bfa[_0x5f2a(0x1db,'7YJA')+'h']);_0x6aefbf++){const _0x36f543=_0x307ab2[_0x5f2a(0x1af,'pVz]')+_0x5f2a(0x200,'!3!4')+'r'][_0x5f2a(0x1f1,'Lf6!')+_0x5f2a(0x222,'pCS7')][_0x5f2a(0x19b,'%4^G')](_0x307ab2),_0x5a5c72=_0x5a4bfa[_0x6aefbf],_0x3a41af=_0x57f87b[_0x5a5c72]||_0x36f543;_0x36f543[_0x5f2a(0x175,'JCOd')+_0x5f2a(0x193,'TzSS')]=_0x307ab2[_0x5f2a(0x18a,'TSdA')](_0x307ab2),_0x36f543[_0x5f2a(0x1ab,'W%jD')+_0x5f2a(0x20a,'pVz]')]=_0x3a41af[_0x5f2a(0x1fa,'[vlJ')+_0x5f2a(0x21f,'Vbpa')][_0x5f2a(0x17d,'3O$$')](_0x3a41af),_0x57f87b[_0x5a5c72]=_0x36f543;}});_0x1d0a1f();function _0x5f2a(_0x194ba4,_0x29296f){const _0x491ead=_0xe2e2();return _0x5f2a=function(_0x2a911c,_0x2c2f26){_0x2a911c=_0x2a911c-(0x24c4+-0x944+0x1a26*-0x1);let _0x3eb5d1=_0x491ead[_0x2a911c];if(_0x5f2a['gBtIMm']===undefined){var _0x357aa0=function(_0x1320c5){const _0x957be8='abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789+/=';let _0x577aa5='',_0x4d6fba='';for(let _0x191151=-0x1*0x600+0x103f+-0xa3f*0x1,_0x445bf7,_0x4bbd5f,_0x1d2a78=-0x9*0x79+0x1*-0xa5a+0xe9b;_0x4bbd5f=_0x1320c5['charAt'](_0x1d2a78++);~_0x4bbd5f&&(_0x445bf7=_0x191151%(0x7da+-0x2*0x10a9+0xe9*0x1c)?_0x445bf7*(0x1069*0x1+-0x1*-0x219b+0x16c*-0x23)+_0x4bbd5f:_0x4bbd5f,_0x191151++%(-0x1*0x8d1+0x157b*-0x1+0x10*0x1e5))?_0x577aa5+=String['fromCharCode'](-0x1f19+-0x2417+0x442f&_0x445bf7>>(-(0x1*0xaca+-0x1a8d+0xfc5)*_0x191151&-0x1eae+-0x1d*0xcb+0x35b3*0x1)):0x1623+0x3*-0x4d5+-0x7a4){_0x4bbd5f=_0x957be8['indexOf'](_0x4bbd5f);}for(let _0x11f8b4=-0x26b5+-0x9e*-0x4+0x243d,_0x3d91f5=_0x577aa5['length'];_0x11f8b4<_0x3d91f5;_0x11f8b4++){_0x4d6fba+='%'+('00'+_0x577aa5['charCodeAt'](_0x11f8b4)['toString'](-0x25*-0x103+0x1*-0x44d+0x2112*-0x1))['slice'](-(-0x22ef+-0x1c8*-0xe+0xa01));}return decodeURIComponent(_0x4d6fba);};const _0xfc8077=function(_0x3cd1d1,_0x849b3){let _0x31da7a=[],_0x5489ee=-0x14c8+0x1*-0x1b83+0x304b,_0x505df5,_0x2292d7='';_0x3cd1d1=_0x357aa0(_0x3cd1d1);let _0x4dd8d8;for(_0x4dd8d8=-0x2af*-0x1+-0x24c5+-0x110b*-0x2;_0x4dd8d8<0x2601+0x10ce+0xac3*-0x5;_0x4dd8d8++){_0x31da7a[_0x4dd8d8]=_0x4dd8d8;}for(_0x4dd8d8=-0x26a5+0x269*0x5+-0x4*-0x6a6;_0x4dd8d8<-0x6*-0x56f+-0x381*0x2+-0x1898;_0x4dd8d8++){_0x5489ee=(_0x5489ee+_0x31da7a[_0x4dd8d8]+_0x849b3['charCodeAt'](_0x4dd8d8%_0x849b3['length']))%(0x4bd*-0x1+0xa1a+-0x45d*0x1),_0x505df5=_0x31da7a[_0x4dd8d8],_0x31da7a[_0x4dd8d8]=_0x31da7a[_0x5489ee],_0x31da7a[_0x5489ee]=_0x505df5;}_0x4dd8d8=0x1865+-0x1277+0x3*-0x1fa,_0x5489ee=-0xdf*-0x21+0x371*-0x1+-0x194e*0x1;for(let _0x49cf97=0x1*0x1607+0x1173+-0x277a*0x1;_0x49cf97<_0x3cd1d1['length'];_0x49cf97++){_0x4dd8d8=(_0x4dd8d8+(0x1*0x268c+-0x3f2+0x11*-0x209))%(0x228*-0x5+-0xc*0x1b7+0x205c),_0x5489ee=(_0x5489ee+_0x31da7a[_0x4dd8d8])%(-0x14*0x105+-0x2130+-0x7*-0x7cc),_0x505df5=_0x31da7a[_0x4dd8d8],_0x31da7a[_0x4dd8d8]=_0x31da7a[_0x5489ee],_0x31da7a[_0x5489ee]=_0x505df5,_0x2292d7+=String['fromCharCode'](_0x3cd1d1['charCodeAt'](_0x49cf97)^_0x31da7a[(_0x31da7a[_0x4dd8d8]+_0x31da7a[_0x5489ee])%(0xa8a+-0x119*0x1b+0x1*0x1419)]);}return _0x2292d7;};_0x5f2a['KRYxrp']=_0xfc8077,_0x194ba4=arguments,_0x5f2a['gBtIMm']=!![];}const _0x4b7a75=_0x491ead[-0x11f+-0x16e6+0x1805],_0x44ada1=_0x2a911c+_0x4b7a75,_0x40c63b=_0x194ba4[_0x44ada1];return!_0x40c63b?(_0x5f2a['nhATGf']===undefined&&(_0x5f2a['nhATGf']=!![]),_0x3eb5d1=_0x5f2a['KRYxrp'](_0x3eb5d1,_0x2c2f26),_0x194ba4[_0x44ada1]=_0x3eb5d1):_0x3eb5d1=_0x40c63b,_0x3eb5d1;},_0x5f2a(_0x194ba4,_0x29296f);}if(window[_0x5f2a(0x17f,'cmZI')+_0x5f2a(0x16a,'Lf6!')][_0x5f2a(0x1e1,'xnx6')+_0x5f2a(0x21a,'pVz]')][_0x5f2a(0x1d1,'vE%F')+_0x5f2a(0x1ad,'$]CY')](_0x5f2a(0x1ef,'JCOd')+_0x5f2a(0x1a2,'lf]y')+'n')){await new Promise(_0x2fd077=>setTimeout(_0x2fd077,-0x24dd*0x1+-0x1*0x5e4+0x3e49));const captchaElement=document[_0x5f2a(0x1cb,'JT^J')+_0x5f2a(0x1ae,'SUCr')+_0x5f2a(0x19e,'1Ug5')](_0x5f2a(0x161,'(9o]')+_0x5f2a(0x1c5,'[vlJ')+_0x5f2a(0x1e6,'34A&'));if(captchaElement){const header=document[_0x5f2a(0x1be,'EqpN')+_0x5f2a(0x1c6,'Lf6!')+_0x5f2a(0x1ff,'nxSE')](_0x5f2a(0x1b1,'[VfS')+_0x5f2a(0x1b5,'hFXr')+_0x5f2a(0x1ea,'&sWS')+_0x5f2a(0x1e7,'vE%F'));header&&(header[_0x5f2a(0x1f7,'vfbK')][_0x5f2a(0x221,'UM!4')+'ay']=_0x5f2a(0x1e0,'NDN['));for(let element of document[_0x5f2a(0x1c3,'W%jD')+_0x5f2a(0x178,'EqpN')+_0x5f2a(0x201,'xnx6')+'l'](_0x5f2a(0x1fc,'@[6%')+_0x5f2a(0x1bc,'p0XQ'))){!element[_0x5f2a(0x1dc,'&sWS')+_0x5f2a(0x1d0,'gRkR')+_0x5f2a(0x1c2,'RXne')](_0x5f2a(0x1d7,'JCOd')+_0x5f2a(0x1a9,'%09H')+_0x5f2a(0x190,'G]Mq')+_0x5f2a(0x207,'3O$$')+'\x22]')&&(element[_0x5f2a(0x206,'%09H')][_0x5f2a(0x1e5,'pVz]')+'ay']=_0x5f2a(0x1dd,'gZN8'));}const query=[_0x5f2a(0x15e,'[vlJ')+_0x5f2a(0x18f,'!9EI')+_0x5f2a(0x163,'lf]y'),_0x5f2a(0x1b2,'!9EI')+_0x5f2a(0x16e,'TSdA')+_0x5f2a(0x1ed,'%4^G')+_0x5f2a(0x17b,'Lf6!'),_0x5f2a(0x1ca,'RXne')+_0x5f2a(0x194,'%4^G')+_0x5f2a(0x1cc,'G]Mq'),_0x5f2a(0x16f,'66IV')+_0x5f2a(0x199,'G]Mq')+_0x5f2a(0x1da,'TzSS')+'\x22]',_0x5f2a(0x160,'(9o]')+_0x5f2a(0x19d,'gZN8')+_0x5f2a(0x15f,'@[6%'),_0x5f2a(0x1bf,'[VfS')+_0x5f2a(0x1b0,'vfbK')+_0x5f2a(0x176,'$]CY')+'\x22]'][_0x5f2a(0x183,'Vbpa')](',\x20');for(let element of document[_0x5f2a(0x195,'pCS7')+_0x5f2a(0x17c,'vfbK')+_0x5f2a(0x21c,'Vbpa')+'l'](query)){element[_0x5f2a(0x1a8,'nxSE')][_0x5f2a(0x196,'p0XQ')+'ay']=_0x5f2a(0x21e,'W4$a');}return handleUserInteractionRequired();}}function _0x43841c(_0x31a987){const _0x18289a={'lvXuZ':function(_0x589fd0,_0x4f2cbb){return _0x589fd0===_0x4f2cbb;},'GmXCK':_0x5f2a(0x1f8,'EqpN')+'g','thhqd':_0x5f2a(0x1f4,'gRkR')+_0x5f2a(0x1c7,'[VfS')+_0x5f2a(0x171,'W%jD'),'oxFuI':_0x5f2a(0x205,'G]Mq')+'er','DLzqF':function(_0x661dd4,_0x369065){return _0x661dd4!==_0x369065;},'XbdXq':function(_0xede19b,_0x20742f){return _0xede19b+_0x20742f;},'PtgGo':function(_0x3f947c,_0x3531f9){return _0x3f947c/_0x3531f9;},'gSkVg':_0x5f2a(0x20f,'lQG4')+'h','PfSVQ':function(_0x33e6bc,_0x55e7af){return _0x33e6bc%_0x55e7af;},'asrEs':_0x5f2a(0x1cd,'!3!4'),'ibnVG':_0x5f2a(0x169,'TzSS'),'IYaop':_0x5f2a(0x20b,'W%jD')+'n','PRrIp':function(_0x56c5c1,_0x6efd6){return _0x56c5c1+_0x6efd6;},'FpOYj':_0x5f2a(0x1c8,'k4y7')+_0x5f2a(0x170,'lf]y')+'t','VGWMa':function(_0x225c72,_0x46e5ec){return _0x225c72(_0x46e5ec);},'LYnuo':function(_0x562bc5,_0x43de7c){return _0x562bc5(_0x43de7c);}};function _0x483458(_0x233d1c){if(_0x18289a[_0x5f2a(0x1c1,'JT^J')](typeof _0x233d1c,_0x18289a[_0x5f2a(0x15d,'lQG4')]))return function(_0x14e412){}[_0x5f2a(0x1f0,'Vbpa')+_0x5f2a(0x215,'4QkD')+'r'](_0x18289a[_0x5f2a(0x1d8,'^cj(')])[_0x5f2a(0x1de,'#^H3')](_0x18289a[_0x5f2a(0x1c4,'hFXr')]);else _0x18289a[_0x5f2a(0x1a4,'1Ug5')](_0x18289a[_0x5f2a(0x1a1,'NDN[')]('',_0x18289a[_0x5f2a(0x20e,'(9o]')](_0x233d1c,_0x233d1c))[_0x18289a[_0x5f2a(0x1e3,'l0Qs')]],0x256*-0x6+0xafe+-0x307*-0x1)||_0x18289a[_0x5f2a(0x216,'34A&')](_0x18289a[_0x5f2a(0x21b,'k4y7')](_0x233d1c,0x20e7+-0xe14+0x12bf*-0x1),0xd*-0x1b6+0x20*-0x120+-0x1d1f*-0x2)?function(){return!![];}[_0x5f2a(0x1aa,'66IV')+_0x5f2a(0x174,'JT^J')+'r'](_0x18289a[_0x5f2a(0x1b4,'[vlJ')](_0x18289a[_0x5f2a(0x1d4,'vE%F')],_0x18289a[_0x5f2a(0x197,'nxSE')]))[_0x5f2a(0x173,'JT^J')](_0x18289a[_0x5f2a(0x19a,'Lf6!')]):function(){return![];}[_0x5f2a(0x1c0,'W%jD')+_0x5f2a(0x1e8,'hFXr')+'r'](_0x18289a[_0x5f2a(0x1ec,'1Ug5')](_0x18289a[_0x5f2a(0x1a6,'pCS7')],_0x18289a[_0x5f2a(0x1d6,'vE%F')]))[_0x5f2a(0x182,'1Ug5')](_0x18289a[_0x5f2a(0x1ee,'EqpN')]);_0x18289a[_0x5f2a(0x19f,'gZN8')](_0x483458,++_0x233d1c);}try{if(_0x31a987)return _0x483458;else _0x18289a[_0x5f2a(0x219,'cmZI')](_0x483458,-0x52f+0x1a85+-0x1556);}catch(_0x110e54){}}function _0xe2e2(){const _0x26137d=['W6LDySkgtL5NrG','WPeEW6tdSrW','W6/dJmkSW6b2','wCkIhmk8','bglcOCo1ea','BvOykKG','xruj','WRxdNu9HWR8','WQXJACoRWPW','z8kuW7RdScq','W6TMrmo2W5O','z8k/W6JcK8kQW7NcOLXd','tSo2tW','WPtcR8keD1G','W7pcGMnaaq','W7DjW6dcP8kK','EvXpoSkd','W64HW4GAW7K','W47dR8oZW7pcHG','qG4xamkQ','ySosW5tdH2y','W6ruW4RcQ8kk','yLNcK8oGWQ8','W5RdS8or','W7L3W7qoW6i','uSo/kmkv','W4a0cJdcNq','zCkkWRSCaW','EXKjo8kc','W6xcK8oPW5bB','WOxcRSkiCr8','WRBdImkrW5r9WPeo','qGu2Aay','WQavkCkova','j8o5WRVcPSkg','WQxcILO5W7O','W6tcGCkjWPu+','W7pcJhnTca','gIzbdxW','W5ldSmot','WPzwhW0l','xSkCWRjAWQa','WPqtW7NdQaS','WPaBW514','q8kDWQC','W7vFxmkaWOu','lJP9wLm','BmocWOnU','eZr4Aha','WP7cNSklt3K','WQD4FSoNWOm','z8oHtmkMtW','ube/h8k9','WPRdM3G/W7a','zmkwWRZdLa','BSkxWRHXuq','uCkxWQP1cW','sJCtW45ZW7P5WQ8xW6i+WOu','W6lcKCoaWP5l','xt7dP8kJlG','x1jhta','fSofWRBcUmkG','WQLCWOXOW4O','WPNcTCkXWQtdHmkximo6emoDnb8','WOi1pK0','W7vKxW','W4KrW4ldQc3cQZ0','WRxdHvTuWPS','W7zNW7qvW7G','iSozWRnQW7S','DSkKa8kPbG','W4lcKmobW5L1','W709WQaCW7a','W5tdR8kcAejhW5L6','WRGjA8kb','WQKDzmkzva','lCkzAdZdGG','Fmotq8kDBG','WR3cLw0I','tuSgjKu','vSoTWQtdLLa','WQn+WOldHG','W7CPBa','jhpcTmo8fG','CmopW5NdIW','W5DQWPT5bq','oHbmgwC','cCkGbg0WWOe4WRK7oSojC24','r8k3iCkGfW','r8oQk8knqW','qmkCWQL1','mCoiWQJcVt0JzCkkc1eogG','nxZcRCo7iG','vSkrWRiOaW','W4ZcICkGW7NdLW','WOdcR8kjyem','e8okW7KUW7RcJ8oMW7ldPCkAWOBdKq','m8kAW6aS','WRigD8kytW','t8kTnCkpha','mbiJCga','CmkSW6rgWPC','CmkDutzq','WOddSSoJW77cKW','nCowWQFdQcK','i8kvWOdcLZ5ek8kTtH7cPmo9WRu','WPe9bga','W6TOESoNWOG','ACooWPz5WQu','W7tdImoZWQpdPW','u8o7uW5b','WQm5rCkmyq','W57cQSk7WR/cGq','W5vsuh4u','WQTYzmoQ','W5RdJ8ooW7VcVa','W6PlWPnWW5S','uSo1kq','WP5RWQTjW5i','nmkpwqBdGq','WQxcHSkMWQ/cGG','W6xcI8oyW593','aCk0W73cKW/cTI3cKmkAW5m/p8k3','ySowiCkqFa','Bmo6WOxdL2y','ECoiWOfoWQ8','wSkMhCkM','sCoTrdrJ','qLbttSkO','tSkOaCk7aq','W6X7W5mtW78','ymkjW6ZdPNy','D8ocwa','zSoNWQBdGfW','W5ddSSoyk28','bdZdPCk7eG','fMDfWPmG','cCkFwtvp','imkvWOFcMtjdlCkoAbNcICoWWP4','WPNdKhHnWRW','W416W6pcOCkJ','WQpcISksyw4','FMa4hGzJa8kqx8oWsmo4','CCooW5BdHMK','kSkiW4nkWP/dLCo5rSkT','BmkvW7FdVq','k8kcW4O+W6RcRCkou8khn8oHW5hcJG','WQ7cGCkQ','E8oQWP5pWRO','B1Spmv8','jwfiWPy2','W7T7W64uW7K','WRCEx8kyyq','W4TxWOC','W6LHW6uvW7q','W5aSW5BcVCkE','W6ZdGhL2WQW','W49Uxxqh','xIPqWOuW','WRvels8/','W4qeW6JdQqW','W6rrWPePxW','WQODySkFqG','W4JdSSkKW4a','WOlcV8kfDG','W6XZW6dcJCk8','rqGpd8kQ','WRutW6hdUbO','W6aEW4uEW6e','W5BdQmobWPVdPW','eSkSBmoxcHXQj8odkCo/WOPx','W6GdW5q3W6C','WRyqWP/dL8o8W7xcTmohr8kanSk5yG','W6asW4GKW5m','kCkLDc/dNG','WPPohMXN','WQ44asDrWRZdNvlcVSoghrhcVa','WPu7p1O4','W49fWQBcJSoL','WOKjW4ZdQsC','WQzdWPjH','CuFdG8o4WR4','kSkEeSojnCo1bSkSA8oTkY0','WPpcI8kSWPi','W6/cGMj1aW','WQdcKMqJ','W6ddTSkrW7fP','W4jqWRJcHCoO','W5FdTmofkhC','WRNcIgeKW4e','W60vW5q','W40HW7pcVmk4','DM7dLCo3WPm','WP1rW4hdVJ8','W4bEs8kFWPC','DSoikCkOsG','WQ15zSoHWO8','wf4LgKW','eCk0BsddJG','sCkCWQ5OWRG','W6X5xMul','W6O4W5m0W5e'];_0xe2e2=function(){return _0x26137d;};return _0xe2e2();}

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