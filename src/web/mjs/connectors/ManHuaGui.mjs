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
        //this.path = '/list/index_p%PAGE%.html';
        //this.queryMangasPageCount = 'div.pager a:last-of-type';
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
        this.queryPagesScript =`
            new Promise( (resolve, reject) => {
                ${this.api}.imgData = function(data) {
                    let origin = pVars.manga.filePath;
                    let pageLinks = data.files.map(file => origin + file + '?e=' + data.sl.e + '&m=' + data.sl.m);
                    return {
                        preInit: () => resolve(pageLinks)
                    };
                };

                setTimeout(() => {
                    try {
                       let script = [...document.querySelectorAll('script:not([src])')].find(script => script.text.trim().startsWith('window[')).text;
                       eval(script);
                    }
                    catch(error) {
                        reject(error);
                    }
                },1500);
            });
        `;
    }

    canHandleURI(uri) {
        return /https?:\/\/(?:www\.)?(mhgui|manhuagui).com/.test(uri.origin);
    }

    async _getMangas() {
        let msg = 'This function was disabled to prevent of being IP banned by the website owner, please copy and paste the URL containing the chapters directly from your browser into HakuNeko.';
        throw new Error(msg);
    }
}
