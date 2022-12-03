import Connector from '../../engine/Connector.mjs';
import Manga from '../../engine/Manga.mjs';
export default class Lezhin extends Connector {
    constructor() {
        super();
        super.id = undefined;
        super.label = undefined;
        this.tags = [];
        this.url = undefined;
        this.apiURL = 'https://www.lezhinus.com';
        // /lz-api/v2/
        this.cdnURL = 'https://cdn.lezhin.com';
        this.userID = undefined;
        this.mangasPerPage = 36;
        this.lzConfig = undefined;
        // Private members for internal use that can be configured by the user through settings menu (set to undefined or false to hide from settings menu!)
        this.config = {
            username: {
                label: 'E-Mail',
                description: 'E-Mail for login with your Lezhin account.\nAn account is required to access R-rated content.',
                input: 'text',
                value: ''
            },
            password: {
                label: 'Password',
                description: 'Password for login with your Lezhin account.\nAn account is required to access R-rated content.',
                input: 'password',
                value: ''
            },
            forceJPEG: {
                label: 'Force JPEG',
                description: 'Always use JPEG instead of WEBP images, even when WEBP images would be available.\nNote: The WEBP images are smaller in size but still provide the same or even slightly better quality.',
                input: 'checkbox',
                value: true
            }
        };
    }
    async _initializeAccount() {
        if(this.userID || !this.config.username.value || !this.config.password.value) {
            return;
        }
        let script = `
        new Promise((resolve, reject) => {
            try {
                if($('#log-nav-email').length) {
                    return resolve();
                }
                const form = $('form#email');
                form.find('input#login-email').val('${this.config.username.value}');
                form.find('input#login-password').val('${this.config.password.value}');
                $.ajax({
                    type: 'POST',
                    url: form.prop('action'),
                    data: form.serialize(),
                    success: resolve,
                    error: reject
                });
            }
            catch(error) {
                reject(error);
            }
        });
        `;
        let request = new Request(new URL(this.url + '/login'), this.requestOptions);
        await Engine.Request.fetchUI(request, script);
        let response = await fetch(new Request(new URL(this.url + '/account'), this.requestOptions));
        let data = await response.text();
        let cdn = data.match(/cdnUrl\s*:\s*['"]([^'"]+)['"]/);
        let user = data.match(/userId\s*:\s*['"](\d+)['"]/);
        let token = data.match(/token\s*:\s*['"]([^'"]+)['"]/);
        this.cdnURL = cdn ? cdn[1] : this.cdnURL;
        this.userID = user ? user[1] : undefined;
        if(this.userID) {
            await fetch(this.url + '/adultkind?path=&sw=all', this.requestOptions);
        }
        // force user locale user setting to be the same as locale from the currently used website ...
        // => prevent a warning webpage that would appear otherwise when loading chapters / pages
        return fetch(this.url + '/locale/' + this.locale, this.requestOptions);
    }
    async _getMangaFromURI(uri) {
        let request = new Request(uri, this.requestOptions);
        let data = await this.fetchDOM(request, 'div.comicInfo__detail h2.comicInfo__title');
        let id = uri.pathname.match(/comic\/([^/]+)/)[1];
        let title = data[0].textContent.trim();
        return new Manga(this, id, title);
    }
    async _getMangas(){
        let mangaList = [];
        for (let page = 0, run = true; run; page++) {
            let mangas = await this._getMangasFromPage(page);
            mangas.length > 0 ? mangaList.push(...mangas) : run = false;
        }
        return mangaList;
    }
    async _getMangasFromPage(page){
        //https://www.lezhinus.com/lz-api/v2/contents?menu=general&limit=36&offset=0&order=popular
        const uri = new URL('/lz-api/v2/comics', this.apiURL);
        uri.searchParams.set('menu', 'general');
        uri.searchParams.set('limit', this.mangasPerPage);
        uri.searchParams.set('offset', page * this.mangasPerPage);
        uri.searchParams.set('order', 'popular');
        uri.searchParams.set('adult_kind', 'all');

        const request = new Request(uri, this.requestOptions)
        const data = await this.fetchJSON(request);
        return data.data.map( manga => {
            return {
                id: manga.alias, // manga.id
                title: manga.title
            };
        });
    }
 
    async _getChapters(manga) {
        await this._initializeAccount();
        /*
        *let purchased = [];
        *let subscription = false;
        *if(this.accessToken) {
        *    let uri = new URL(`${this.apiURL}/users/${this.userID}/contents/${mangaiD}`);
        *    let request = new Request(uri, this.requestOptions);
        *    request.headers.set('authorization', 'Bearer ' + this.accessToken);
        *    let data = await this.fetchJSON(request);
        *    purchased = data.data.purchased;
        *    subscription = data.data.subscribed;
        *}
        */
        let script = `
        new Promise((resolve, reject) => {
            // wait until episodes have been updated with purchase info ...
            setTimeout(() => {
                try {
                    let chapters = __LZ_PRODUCT__.all // __LZ_PRODUCT__.product.episodes
                    .filter(chapter => {
                        if(chapter.purchased) {
                            return true;
                        }
                        if(chapter.coin === 0) {
                            return true;
                        }
                        if(chapter.freedAt && chapter.freedAt < Date.now()) {
                            return true;
                        }
                        if(chapter.prefree && chapter.prefree.closeTimer && chapter.prefree.closeTimer.expiredAt > Date.now()) {
                            return true;
                        }
                        return false;
                    })
                    .map(chapter => {
                        return {
                            id: chapter.name, // chapter.id,
                            title: chapter.display.displayName + ' - ' + chapter.display.title,
                            language: '${this.locale}'
                        };
                    });
                    resolve(chapters);
                }
                catch(error) {
                    reject(error);
                }
            },
            2500);
        });
        `;
        let request = new Request(new URL('/comic/' + manga.id, this.url), this.requestOptions);
        return Engine.Request.fetchUI(request, script);
    }
    async _getPages(chapter) {
        await this._initializeAccount();
        /*
        q  | Free  | Purchased
        ----------------------
        10 |  480w |  640w
        20 |  640w |  720w
        30 |  720w | 1080w
        40 | 1080w | 1280w
        */
          
        await this.getLzconfig();
        //https://www.lezhin.com/lz-api/v2/inventory_groups/comic_viewer?platform=web&store=web&alias=angel&name=1&preload=false&type=comic_episode
        let uri = new URL('https://www.lezhin.com/lz-api/v2/inventory_groups/comic_viewer');
        uri.searchParams.set('platform', 'web');
        uri.searchParams.set('store', 'web');
        uri.searchParams.set('alias', chapter.manga.id);
        uri.searchParams.set('name', chapter.id);
        uri.searchParams.set('preload', false);
        uri.searchParams.set('type', 'comic_episode');
        let request = new Request(uri, this.requestOptions);
        let data = await this.fetchJSON(request);
        
        const episode = data.data.extra.episode;
        let purchased = episode.coin == 0;
        //purchased = purchased || (episode.freedAt && episode.freedAt < Date.now());
        const subscribed = data.data.extra.subscribed;
        const updatedAt = episode.updatedAt;
        
        let pictures = [];
        
        for (let i = 0; i < episode.scrollsInfo.length; i++){
        	
        	let tokenuri = new URL('/lz-api/v2/cloudfront/signed-url/generate', this.apiURL);
            tokenuri.searchParams.set('contentId', episode.idComic);
            tokenuri.searchParams.set('episodeId', episode.id);
            tokenuri.searchParams.set('purchased', subscribed || purchased);
            tokenuri.searchParams.set('q', 30);
            tokenuri.searchParams.set('firstCheckType', 'P');
            //get parameters
            request = new Request( tokenuri, this.requestOptions );
            request.headers.set('x-referer', this.apiURL);
            let response = await this.fetchJSON(request);
            //picture final url
            let imageurl = new URL('/v2' + episode.scrollsInfo[i].path + '.webp', this.lzConfig.contentsCdnUrl);
            imageurl.searchParams.set('purchased', subscribed || purchased);
            imageurl.searchParams.set('q', 30);
            imageurl.searchParams.set('updated', updatedAt);
            //add missing parameters to the image url
            imageurl.searchParams.set('Policy', response.data.Policy);
            imageurl.searchParams.set('Signature', response.data.Signature);
            imageurl.searchParams.set('Key-Pair-Id', response.data['Key-Pair-Id']);
            pictures.push(imageurl.href);
        }
        
        return pictures;
        
        /*
        
const script = `
new Promise((resolve, reject) => {
    setTimeout(() => {
        try {
            if(window.location.pathname.includes('/login')) {
                throw new Error('You need to be logged in to access the content of this chapter!');
            }
            const subscribed = __LZ_DATA__.product && __LZ_DATA__.product.subscribed;
            const purchased = __LZ_DATA__.purchased && __LZ_DATA__.purchased.includes(__LZ_DATA__.episode.id);
            const hasOnlyJPEG = false;
            const updated = __LZ_DATA__.episode.updatedAt;
            const images = __LZ_DATA__.episode.scrollsInfo.map(x => {
                //const extension = ${this.config.forceJPEG.value} || hasOnlyJPEG ? '.jpg' : '.webp';
                const extension ='.webp';
                //request to generate the url
                //https://www.lezhinus.com/lz-api/v2/cloudfront/signed-url/generate?contentId=XXXXXXX&episodeId=YYYYYYYYY&purchased=false&q=30&firstCheckType=P
                const tokenuri = new URL('/lz-api/v2/cloudfront/signed-url/generate', '${this.apiURL}');
                tokenuri.searchParams.set('contentId', __LZ_DATA__.episode.contentId);
                tokenuri.searchParams.set('episodeId', __LZ_DATA__.episode.id);
                tokenuri.searchParams.set('purchased', subscribed || purchased);
                tokenuri.searchParams.set('q', 30);
                tokenuri.searchParams.set('firstCheckType', 'P');
                //picture final url
                const uri = new URL('/v2' + x.path + extension, __LZ_CONFIG__.contentsCdnUrl);
                uri.searchParams.set('purchased', subscribed || purchased);
                uri.searchParams.set('q', 30);
                uri.searchParams.set('updated', updated);
                return {
                imgurl : uri.href, token : tokenuri.href, referer : window.location.href}
                ;
            });
            resolve(images);
        }
        catch(error) {
            reject(error);
        }
    },
    5000);
});
`;
try{
    const uri = new URL(`${
    this.url}
    /comic/${
    chapter.manga.id}
    /${
    chapter.id}
    `);
    let request = new Request(uri, this.requestOptions);
    let data = await Engine.Request.fetchUI(request, script);
    let imageslist = [];
    for (let i = 0; i < data.length; i++){
        let element = data[i];
        let imageurl = new URL(element.imgurl);
        //get the missing parameters from the JSON request (unique for each image)
        let requesturl = new URL(element.token);
        request = new Request( requesturl, this.requestOptions );
        request.headers.set('x-referer', element.referer);
        let response = await this.fetchJSON(request);
        //add missing parameters to the image url
        imageurl.searchParams.set('Policy', response.data.Policy);
        imageurl.searchParams.set('Signature', response.data.Signature);
        imageurl.searchParams.set('Key-Pair-Id', response.data['Key-Pair-Id']);
        imageslist.push(imageurl.href);
    }
    return (imageslist);
}
catch (e)
{
    throw ('Chapter not purchased / Not logged / Error fetching pages !');
}
        */
     
    }
    async getLzconfig() {
        if(this.lzConfig) return;
        //get LZCONFIG
        const uri = new URL(`${
        this.url}
        `);
        const script = `
        new Promise((resolve, reject) => {
            setTimeout(() => {
                try {
                    if(window.location.pathname.includes('/login')) {
                        throw new Error('You need to be logged in to access the content of this chapter!');
                    }
                    const lz = __LZ_CONFIG__;
                    resolve(lz);
                }
                catch(error) {
                    reject(error);
                }
            },
            5000);
        });
        `;
        const request = new Request(uri, this.requestOptions);
        const data = await Engine.Request.fetchUI(request, script);
        this.lzConfig = data;
    }
    /*
    
_getMangaFromPage( offset, limit ) {
    offset = offset || 0;
    limit = limit || 500;
    let uri = new URL( this.apiURL + '/comics' );
    uri.searchParams.set( 'offset', offset );
    uri.searchParams.set( 'limit', limit );
    uri.searchParams.set( 'country_code', '' );
    uri.searchParams.set( 'store', 'web' );
    uri.searchParams.set( 'adult_kind', 'all' );
    uri.searchParams.set( 'filter', 'all' );
    //uri.searchParams.set( '_', Date.now() );
    return fetch( uri.href, this.requestOptions )
    .then( response => response.json() )
    .then( data => {
        if( data.code ) {
            throw new Error( data.description );
        }
        let mangaList = data.data.map( manga => {
            return {
                id: manga.alias, // manga.id
                title: manga.title
            };
        }
        );
        if( data.hasNext ) {
            return this._getMangaFromPage( offset + limit, limit )
            .then( mangas => mangaList.concat( mangas ) );
        }
        else {
            return Promise.resolve( mangaList );
        }
    }
    );
}
_getMangaList( callback ) {
    this._getMangaFromPage()
    .then( data => {
        callback( null, data );
    }
    )
    .catch( error => {
        console.error( error, this );
        callback( error, undefined );
    }
    );
}
    */
    
    
}
