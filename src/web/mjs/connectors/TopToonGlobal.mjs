import Connector from '../engine/Connector.mjs';
import Manga from '../engine/Manga.mjs';
export default class TopToonGlobal extends Connector {
    constructor() {
        super();
        super.id = 'toptoonglobal';
        super.label = 'TOPTOON Global (English)';
        this.tags = [ 'webtoon', 'english' ];
        this.url = 'https://global.toptoon.com';
        this.api ='https://api.toptoonplus.com'
    }
    /*
    async _getMangaFromURI(uri) {
    const request = new Request(uri, this.requestOptions);
    const data = await this.fetchDOM(request, 'div.bnr_episode_info p.tit_toon');
    return new Manga(this, uri.pathname, data[0].textContent.trim());
    }
    */
    async _getMangas() {
        const request = new Request(new URL('/api/v1/page/genres', this.api), this.requestOptions);
        request.headers.set('language', 'en');
        request.headers.set('ua', 'web');
        request.headers.set('x-api-key', 'SUPERCOOLAPIKEY2021#@#(');
        request.headers.set('x-origin', 'global.toptoon.com');
        request.headers.set('user-id', '');
        request.headers.set('partnerCode', '');

        
        const data = await this.fetchJSON(request);
        return data.data.genres.map(item => {
            let link = '/content/'+item.information.title;
            link = link.replace(' ', '-');
            link = link.replace(/[\?]/g, '');
            link = link + '/'+ item.comicId;
            return{
                id: link,
                title: item.information.title
            };
        });
    }
    async _getChapters(manga) {
        const mangaid = manga.id.match(/\/([0-9]+$)/)[1];
        const request = new Request(new URL('/api/v1/page/episode?comicId='+mangaid, this.api), this.requestOptions);
        request.headers.set('language', 'en');
        request.headers.set('ua', 'web');
        request.headers.set('x-api-key', 'SUPERCOOLAPIKEY2021#@#(');
        request.headers.set('x-origin', 'global.toptoon.com');
        request.headers.set('user-id', '');
        request.headers.set('partnerCode', '');

        const data = await this.fetchJSON(request);
        return data.data.episode.map(item => {
            let link = '/content/content/'+mangaid+'/'+item.episodeId;
            return{
                id: link,
                title: item.information.title
            };
        })
        .reverse();
    }
    async _getPages(chapter) {
        const mangaid = chapter.id.match(/content\/([0-9]+)/)[1];
        const chapterid = chapter.id.match(/\/([0-9]+$)/)[1];
        
        let request = new Request(new URL(this.url), this.requestOptions);
        let secretKey = await Engine.Request.fetchUI(request, 'localStorage.getItem("udid") || ""');       
        
        
        const uri = new URL('/api/v2/viewer/'+mangaid+'/'+chapterid, this.api);
        let body = {
            action : 'view_contents',
            cToken : '',
            isCached : false,
            location : 'viewer',
        };
        
        let pdata = this.generatePayloadData(secretKey);
        
        request = new Request(uri, {
            method: 'POST',
            body: JSON.stringify(body),
            headers: {
                'Accept': '*/*',
                'Content-Type': 'application/json',
                'x-referrer': this.url,
                'language': 'en',
                'ua':'web',
                'x-api-key': pdata.k,
                'Origin': 'global.toptoon.com',
                'x-origin': 'global.toptoon.com',
                'user-id': '',
                'deviceId': secretKey,
                'partnerCode':'',
                'timestamp' : pdata.t,
                'version' : '1.18.189a', 
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; rv:107.0) Gecko/20100101 Firefox/107.0',
            }
        });
        let data = await fetch(request);
        data = await data.json();
    }
    
      generatePayloadData(uuid){
        //timestampUTC+MS

        //var hash = r.createHash('sha256').update(uuid.toString().replace(/-/g, ''.concat(timestamp))).digest('hex');
        //return r.pbkdf2Sync(''.concat(uuid, '|').concat(timestamp), hash, iterations (for now 257), hash.length, 'sha512').toString('base64')
        //this has been tested with fixed values and it works
        
        let timestamp = Date.now().toString()+ (Math.trunc(Math.random() * (999 - 100) + 100)).toString();
        let message = uuid.toString().replace(/-/g, ''.concat(timestamp));
        let salt = CryptoJS.SHA256(message).toString();
        let cfg = {
            keySize: 64,
            hasher: CryptoJS.algo.SHA512,
            iterations: 257
        };
        message = uuid + '|'+timestamp;
        let apikey = CryptoJS.PBKDF2(message, salt, cfg).toString(CryptoJS.enc.Base64);
        return {k : apikey, t : timestamp }
    }
}
