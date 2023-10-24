import Connector from '../engine/Connector.mjs';
import Manga from '../engine/Manga.mjs';

export default class BilibiliManhua extends Connector {

    constructor() {
        super();
        super.id = 'neteasecomic';
        super.label = 'Bilibili Manhua (Chinese)';
        this.tags = [ 'manga', 'webtoon', 'chinese' ];
        this.url = 'https://manga.bilibili.com';
        this.token_expires_at = -1;
        this.auth = {
            accessToken : '',
            refreshToken : '',
            area : 1
        };
        this.areacode = { 1: 'us-user', 2: 'sg-user'};
        this.credServer = 'https://%AREA%.bilibilicomics.com';

        this.links = {
            login: 'https://passport.bilibili.com/login'
        };
        //default config doesnt need language switch, its fixed to CN
        this.config = {
            format: {
                label:'Preferred format',
                description:'Format of images\nwebp(low)\n jpg(medium)\n png(high))',
                input:'select',
                options:[
                    { value:'webp', name:'webp' },
                    { value:'jpg', name:'jpg' },
                    { value:'png', name:'png' },
                ],
                value: 'png'
            },
            language: {
                label: 'Language Settings',
                description: 'Choose the language to use. This will affect available manga in list',
                input: 'disabled',
                value: 'cn'
            },
            picquality: {
                label: 'Quality Settings',
                description: 'Choose the prefered quality',
                input: 'select',
                options: [
                    { value: 'veryhigh', name:'VeryHigh' },
                    { value: 'good', name:'Good' },
                    { value: 'normal', name:'Normal' },
                    { value: 'poor', name:'Poor' },
                    { value: 'verypoor', name:'VeryPoor' },
                ],
                value: 'good'
            },
            forcepicturesize: {
                label: 'Force max quality (Experimental)',
                description: 'Force server to send pictures with maxsize. Override "quality settings"',
                input: 'checkbox',
                value: false
            }
        };
    }

    getImageSizeByQuality(width) {
        const ratioArray = { "verypoor":0.4, "poor":0.5, "normal":0.7, "good":0.85, "veryhigh":1 };
        const widthArray = { verypoor:350, poor:450, normal:800, good:1100, veryhigh:1600 };

        let o = {
            imgWidth:width,
            quality:undefined
        };

        //sometimes pictures size from JSON are 0 in this case Bibili forcea 0.85 ratio ,"Good"quality.
        if (width < 1) {
            o.imgWidth = widthArray.good;
            return o;
        }

        const choosedQuality = ratioArray[this.config.picquality.value];
        const calcWidth = Math.floor(width * choosedQuality); //0.85
        switch(choosedQuality) {
            case ratioArray.verypoor:
                calcWidth > widthArray.verypoor && (o.imgWidth = widthArray.verypoor);
                break;
            case ratioArray.poor:
                calcWidth > widthArray.poor && (o.imgWidth = widthArray.poor);
                break;
            case ratioArray.normal:
                calcWidth > widthArray.normal && (o.imgWidth = widthArray.normal);
                break;
            case ratioArray.good:
                calcWidth > widthArray.good && (o.imgWidth = widthArray.good);
                break;
            case ratioArray.veryhigh:
                calcWidth > widthArray.veryhigh && (o.imgWidth = widthArray.veryhigh);
        }

        if (this.config.forcepicturesize.value) o.imgWidth = Math.max(o.imgWidth, width);
        return o;
    }

    async _initializeConnector() {
        await this.getToken();
        if(this.auth.refreshToken) await this.refreshToken();
    }

    async refreshToken() {
        try {
            const now = Math.floor(Date.now() / 1000);
            const data = await this._fetchWithAccessToken('/RefreshToken', {refresh_token : this.auth.refreshToken});
            this.auth.accessToken = data.data.access_token;
            this.auth.refreshToken = data.data.refresh_token;
            this.token_expires_at = now + 60*10;//expires in 10 minutes
        } catch (error) {
            //
        }

    }

    async getToken() {
        try {

            const now = Math.floor(Date.now() / 1000);
            let cooki = require('electron');
            cooki = await cooki.remote.session.defaultSession.cookies.get({ url: this.url, name : "access_token" });

            //if there is no cookie user is disconnected, force cleanup
            if (cooki.length == 0) throw new Error('User is not connected.');

            //if token is not defined, get it from cookies
            if (!this.auth.accessToken) {
                const cookie_value = cooki[0].value;
                this.auth.area = JSON.parse(decodeURIComponent(cookie_value)).area;
                this.auth.accessToken = JSON.parse(decodeURIComponent(cookie_value)).accessToken;
                this.auth.refreshToken = JSON.parse(decodeURIComponent(cookie_value)).refreshToken;
                this.token_expires_at = now + 60*10; //expires in 10 minutes
                return;
            }

            //if token exists check if expired
            if (this.auth.accessToken && this.token_expires_at < now) {
                await this.refreshToken();
                return;
            }

        } catch(error) {
            this.auth.accessToken = '';
            this.auth.refreshToken = '';
            this.auth.area = 1;
            this.token_expires_at = -1;

        }

    }

    async _fetchTwirp(path, body) {
        await this.getToken();
        const uri = new URL('/twirp/comic.v1.Comic' + path, this.url);
        uri.searchParams.set('device', 'pc');
        uri.searchParams.set('platform', 'web');
        uri.searchParams.set('lang', this.config.language.value);
        uri.searchParams.set('sys_lang', this.config.language.value);
        let request = new Request(uri, {
            method: 'POST',
            body: JSON.stringify(body),
            headers: {
                'x-origin': this.url,
                'Content-Type': 'application/json;charset=UTF-8',
                'x-referer':  uri,
            }
        });
        if (this.auth.accessToken) request.headers.set('Authorization', ' Bearer '+ this.auth.accessToken);
        const data = await this.fetchJSON(request);
        return data.data;
    }

    async _getMangaFromURI(uri) {
        const data = await this._fetchTwirp('/ComicDetail', {
            comic_id: parseInt(uri.pathname.match(/\/mc(\d+)/)[1])
        });
        return new Manga(this, data.id, data.title);
    }

    async _getMangas() {
        let mangaList = [];
        for(let page = 1, run = true; run; page++) {
            let mangas = await this._getMangasFromPage(page);
            mangas.length > 0 ? mangaList.push(...mangas) : run = false;
        }
        return mangaList;
    }

    async _getMangasFromPage(page) {
        const data = await this._fetchTwirp('/ClassPage', {
            style_id: -1,
            area_id: -1,
            is_free: -1,
            is_finish: -1,
            order: 0,
            page_size: 18,
            page_num: page
        });
        return data.map(entry => {
            return {
                id: entry.season_id,
                title: entry.title.trim()
            };
        });
    }

    async _getChapters(manga) {
        const data = await this._fetchTwirp('/ComicDetail', {
            comic_id: manga.id
        });
        return data.ep_list.filter(entry => entry.is_in_free || !entry.is_locked).map(entry => {
            return {
                id: entry.id,
                title: entry.short_title + ' - ' + entry.title,
                language: ''
            };
        });
    }

    async _getPages(chapter) {
        await this.getToken();
        let credz = null;
        let data = null;

        //Using access_token from cookies, try to get token for unlocked chapters
        if (this.auth.accessToken) {
            credz = await this._fetchWithAccessToken('/GetCredential', {
                ep_id: chapter.id,
                comic_id : chapter.manga.id,
                type : 1
            });
        }
        //if we got chapter credentials, fetch full chapter using them
        if (credz && credz.data && credz.data.credential) {
            data = await this._fetchTwirp('/GetImageIndex', {
                ep_id: chapter.id,
                credential : credz.data.credential
            });
        } else {
            //get only 2 picture for locked chapter or full pictures if free chapter
            data = await this._fetchTwirp('/GetImageIndex', {
                ep_id: chapter.id,
            });
        }

        let images = data.images.map(image => {
            const qualdata = this.getImageSizeByQuality(image.x);
            let suffix = qualdata.imgWidth + 'w';
            suffix += qualdata.quality ? '_' + qualdata.quality + 'q' : '';
            return image.path + '@' + suffix + '.'+this.config.format.value;
        });

        images = await this._fetchTwirp('/ImageToken', {
            urls: JSON.stringify(images)
        });
        return images.map(image => image.url + '?token=' + image.token);
    }

    async _fetchWithAccessToken(path, body) {
        const server = this.credServer.replace('%AREA%', this.areacode[this.auth.area]);
        const uri = new URL('/twirp/global.v1.User' + path, server);
        uri.searchParams.set('device', 'pc');
        uri.searchParams.set('platform', 'web');
        uri.searchParams.set('lang', this.config.language.value);
        uri.searchParams.set('sys_lang', this.config.language.value);
        let request = new Request(uri, {
            method: 'POST',
            body: JSON.stringify(body),
            headers: {
                'x-origin': this.url,
                'Content-Type': 'application/json;charset=utf-8',
                'x-referer':  server,
                'x-sec-fetch-site': 'same-site',
                'Authorization' : ' Bearer '+ this.auth.accessToken
            }
        });
        return await this.fetchJSON(request);
    }
}
