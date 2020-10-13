import ZYMK from './templates/ZYMK.mjs';

export default class CocoManHua extends ZYMK {

    constructor() {
        super();
        super.id = 'cocomanhua';
        super.label = 'Coco漫画';
        this.tags = [ 'webtoon', 'chinese' ];
        this.url = 'https://www.cocomanhua.com';

        this.path = '/show?page=';
        this.pathSuffix = '';
        this.queryMangaTitle = 'dl.fed-deta-info dd.fed-deta-content h1.fed-part-eone';
        this.queryMangasPageCount = 'div.fed-page-info a.fed-show-sm-inline';
        this.queryMangas = 'ul.fed-list-info li.fed-list-item a.fed-list-title';
        this.queryChapters = 'div.all_data_list ul li a';
        this.queryPage = `
            new Promise(resolve => {
                /*
                let fn = window.eval;
                window.eval = function(script) {
                    const result = fn(script);
                    if(script.includes('enc_code1') && script.includes('READKEY')) {
                        console.log(script);
                        mh_info.totalimg = mh_info.totalimg || result;
                    }
                    return result;
                };
                __cr.showPic();
                */
                try {
                    mh_info.totalimg = mh_info.totalimg || __cdecrypt('fw12558899ertyui', CryptoJS.enc.Base64.parse(mh_info.enc_code1).toString(CryptoJS.enc.Utf8));
                } catch (error) {
                    mh_info.totalimg = mh_info.totalimg || __cdecrypt('JRUIFMVJDIWE569j', CryptoJS.enc.Base64.parse(mh_info.enc_code1).toString(CryptoJS.enc.Utf8));
                }
                resolve(new Array(parseInt(mh_info.totalimg)).fill().map((_, index) => new URL(__cr.getPicUrl(index + 1), window.location.origin).href));
            });
        `;
    }
}