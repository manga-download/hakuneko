import SinMH from './templates/SinMH.mjs';

export default class ManHuaGui extends SinMH {

    constructor() {
        super();
        super.id = 'manhuagui';
        super.label = '看漫画 (ManHuaGui)';
        this.tags = [ 'webtoon', 'chinese' ];
        this.url = 'https://www.manhuagui.com';
        this.requestOptions.headers.set('x-referer', this.url);

        this.api = 'SMH';
        this.queryChapters = 'div.chapter-list ul li a';
        this.config = {
            throttle: {
                label: 'Page Throttle Requests [ms]',
                description: 'Enter the timespan in [ms] to delay consecuitive HTTP requests while downloading Pages.\nThe website may ban your IP for to many consecuitive requests.',
                input: 'numeric',
                min: 500,
                max: 10000,
                value: 2500
            }
        };
        this.scriptPages =`
            new Promise((resolve, reject) => {
                setTimeout(() => reject(new Error('Failed to get page links!')), 5000);
                SMH.imgData = function(data) {
                    let origin = 'https://' + servs[pVars.curServ].hosts[pVars.curHost].h + '.hamreus.com';
                    let pageLinks = data.files.map(file => origin + data.path + file + '?cid=' + data.cid + '&md5=' + data.sl.md5);
                    return {
                        preInit: () => resolve(pageLinks)
                    };
                };
                let script = [...document.querySelectorAll('script:not([src])')].find(script => script.text.trim().startsWith('window[')).text;
                eval(script);
            } );
        `;
    }

    async _getMangas() {
        let msg = 'This website does not provide a manga list, please copy and paste the URL containing the chapters directly from your browser into HakuNeko.';
        throw new Error(msg);
    }
}