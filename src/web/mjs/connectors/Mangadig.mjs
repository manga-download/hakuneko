import ZYMK from './templates/ZYMK.mjs';

export default class Mangadig extends ZYMK {

    constructor() {
        super();
        super.id = 'mangadig';
        super.label = 'Mangadig';
        this.tags = [ 'webtoon', 'english' ];
        this.url = 'https://mangadig.com';

        this.path = '/show?page=';
        this.pathSuffix = '';
        this.queryMangaTitle = 'dl.fed-deta-info dd.fed-deta-content h1.fed-part-eone';
        this.queryMangasPageCount = 'div.fed-page-info a.fed-show-sm-inline';
        this.queryMangas = 'ul.fed-list-info li.fed-list-item a.fed-list-title';
        this.queryChapters = 'div.all_data_list ul li a';

        this.config.throttle = {
            label: 'Throttle Requests [ms]',
            description: 'Enter the timespan in [ms] to delay consecuitive HTTP requests.\nThe website may block images for to many consecuitive requests.',
            input: 'numeric',
            min: 50,
            max: 1000,
            value: 250
        };
        
        this.decryptKey1Arr = ["x2lBpPpg0JKOYl49", "jaXDrsWpOqhEKM48"];
        this.decryptKey2Arr = ["x2lBpPpg0JKOYl49"];


    }

    async _getPages(chapter) {
        const uri = new URL(chapter.id, this.url);
        const request = new Request(uri, this.requestOptions);
        const script =`
                new Promise(resolve => {
                resolve(C_DATA);
            });
        `;

        let C_DATA = await Engine.Request.fetchUI(request, script, 60000, false);
       

        let result = this.downloadParse(C_DATA);
        console.log(result);
        
    }


	 downloadParse(encodedData) {
	    let decryptedData = this.decodeAndDecrypt(encodedData,this.decryptKey1Arr );
	    let mh_info = [];
	    eval(decryptedData); // mh_info

	    let decryptedRelativePath = this.decodeAndDecrypt(mh_info.enc_code2, this.decryptKey2Arr);
	    let decryptedTotalPages = this.decodeAndDecrypt(mh_info.enc_code1, this.decryptKey1Arr);
	}


 	decodeAndDecrypt(value, keyArr) {
 		    const options = {
 		    	mode: CryptoJS.mode.ECB,
					padding: CryptoJS.pad.Pkcs7
 		    };
 		
 		   value = CryptoJS.enc.Base64.parse(value).toString(CryptoJS.enc.Utf8);
		    for (let i = 0; i < keyArr.length; i++) {
		        try {
		        	  let s = CryptoJS.enc.Utf8.parse(keyArr[i]);
		            return CryptoJS.AES.decrypt(value, s, options).toString(CryptoJS.enc.Utf8);
		        } catch (err) {
		            console.log(err.message)
		        }
		    }
		}


    async _handleConnectorURI(payload) {
        const request = new Request(payload.url, this.requestOptions);
        request.headers.set('x-referer', payload.referer);
        const response = await fetch(request);
        let data = await response.blob();
        data = await this._blobToBuffer(data);
        this._applyRealMime(data);
        return data;
    }
}