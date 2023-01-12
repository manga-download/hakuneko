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
        this.cdnURL = 'https://cdn.lezhin.com';
        this.userID = undefined;
        this.mangasPerPage = 36;
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
        if(this.userID) {

            //check if user disconnected
            const uri = new URL(this.url);
            const checkscript = `
            new Promise((resolve, reject) => {
                setTimeout(() => {
                        resolve(__LZ_CONFIG__);
                },5000);
            });
            `;
            const request = new Request(uri, this.requestOptions);
            const data = await Engine.Request.fetchUI(request, checkscript);
            if (!data.token) {
                this.requestOptions.headers.delete('Authorization');
                this.userID = '';
            }
        }

        if(this.userID || !this.config.username.value || !this.config.password.value) {
            return;
        }
        const password = this.config.password.value.replace("'", "\\'"); //escape the password, because if it contains a single quote the script will fail
        let script = `
        new Promise((resolve, reject) => {
            //try {
                if($('#log-nav-email').length) {
                    return resolve();
                }
                const form = $('form#email');
                form.find('input#login-email').val('${this.config.username.value}');
                form.find('input#login-password').val('${password}');
                $.ajax({
                    type: 'POST',
                    url: form.prop('action'),
                    data: form.serialize(),
                    success: resolve,
                    error: reject
                });
           // }
          //  catch(error) {
          //      reject(error);
          //  }
        });
        `;
        let request = new Request(new URL(this.url + '/login'), this.requestOptions);
        await Engine.Request.fetchUI(request, script);
        let response = await fetch(new Request(new URL(this.url + '/account'), this.requestOptions));
        let data = await response.text();
        let cdn = data.match(/cdnUrl\s*:\s*['"]([^'"]+)['"]/);
        let user = data.match(/userId\s*:\s*['"](\d+)['"]/);
        let token = data.match(/token\s*:\s*['"]([^'"]+)['"]/);
        this.requestOptions.headers.set('Authorization', 'Bearer '+token[1]);
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

    async _getMangas() {
        let mangaList = [];
        for (let page = 0, run = true; run; page++) {
            let mangas = await this._getMangasFromPage(page);
            mangas.length > 0 ? mangaList.push(...mangas) : run = false;
        }
        return mangaList;
    }

    async _getMangasFromPage(page) {
        const uri = new URL('/lz-api/v2/comics', this.apiURL);
        uri.searchParams.set('menu', 'general');
        uri.searchParams.set('limit', this.mangasPerPage);
        uri.searchParams.set('offset', page * this.mangasPerPage);
        uri.searchParams.set('order', 'popular');
        uri.searchParams.set('adult_kind', 'all');

        const request = new Request(uri, this.requestOptions);
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
        let script = `
        new Promise((resolve, reject) => {
            // wait until episodes have been updated with purchase info ...
            setTimeout(() => {
              //  try {
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
            //    }
            //    catch(error) {
            //        reject(error);
            //    }
            }, 2500);
        });
        `;
        let request = new Request(new URL('/comic/' + manga.id, this.url), this.requestOptions);
        return Engine.Request.fetchUI(request, script);
    }

    async _getPages(chapter) {
        await this._initializeAccount();

        let uri = new URL('https://www.lezhin.com/lz-api/v2/inventory_groups/comic_viewer');
        uri.searchParams.set('platform', 'web');
        uri.searchParams.set('store', 'web');
        uri.searchParams.set('alias', chapter.manga.id);
        uri.searchParams.set('name', chapter.id);
        uri.searchParams.set('preload', false);
        uri.searchParams.set('type', 'comic_episode');
        let request = new Request(uri, this.requestOptions);
        let data = await this.fetchJSON(request);

        return data.data.extra.episode.scrollsInfo.map(scroll => {
            return this.createConnectorURI({url : scroll.path, infos : JSON.stringify(data)});
        });
    }

    async _handleConnectorURI(payload) {
        /*
        q  | Free  | Purchased
        ----------------------
        10 |  480w |  640w
        20 |  640w |  720w
        30 |  720w | 1080w
        40 | 1080w | 1280w
        */

        let data = JSON.parse(payload.infos);
        const episode = data.data.extra.episode;
        const extension = this.config.forceJPEG.value ? '.jpg' : '.webp';
        let imageurl = new URL('/v2' + payload.url + extension, this.cdnURL);
        let purchased = episode.coin == 0;
        //purchased = purchased || (episode.freedAt && episode.freedAt < Date.now());
        const subscribed = data.data.extra.subscribed;
        const updatedAt = episode.updatedAt;

        let tokenuri = new URL('/lz-api/v2/cloudfront/signed-url/generate', this.apiURL);
        tokenuri.searchParams.set('contentId', episode.idComic);
        tokenuri.searchParams.set('episodeId', episode.id);
        tokenuri.searchParams.set('purchased', subscribed || purchased);
        tokenuri.searchParams.set('q', 40);
        tokenuri.searchParams.set('firstCheckType', 'P');

        //get parameters
        let request = new Request( tokenuri, this.requestOptions );
        request.headers.set('x-referer', this.apiURL);
        let response = await this.fetchJSON(request);

        //update image url
        imageurl.searchParams.set('purchased', subscribed || purchased);
        imageurl.searchParams.set('q', 40);
        imageurl.searchParams.set('updated', updatedAt);
        imageurl.searchParams.set('Policy', response.data.Policy);
        imageurl.searchParams.set('Signature', response.data.Signature);
        imageurl.searchParams.set('Key-Pair-Id', response.data['Key-Pair-Id']);

        request = new Request(imageurl, this.requestOptions);
        response = await fetch(request);
        data = await response.blob();
        data = await this._blobToBuffer(data);
        this._applyRealMime(data);
        return data;
    }
}
