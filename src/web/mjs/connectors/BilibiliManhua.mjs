import Connector from '../engine/Connector.mjs';
import Manga from '../engine/Manga.mjs';

export default class BilibiliManhua extends Connector {

    constructor() {
        super();
        super.id = 'neteasecomic';
        super.label = '哔哩哔哩 漫画 (Bilibili Manhua)';
        this.tags = [ 'manga', 'webtoon', 'chinese' ];
        this.url = 'https://manga.bilibili.com';
        this.lang = 'cn';
        this.access_token = undefined;
        this.refresh_token = undefined;
        this.token_expires_at = undefined;
        this.config = {
            quality:  {
                label: 'Preferred format',
                description: 'format of images\nwebp (low)\njpg (medium)\npng (high))',
                input: 'select',
                options: [
                    { value: 'webp', name: 'webp' },
                    { value: 'jpg', name: 'jpg' },
                    { value: 'png', name: 'png' },
                ],
                value: 'png'
            }
        };
    }

    async getToken() {
        //First get auth token from cookies
        try {
            const now = Math.floor(Date.now() / 1000);
            let cooki = require('electron');
            cooki = await cooki.remote.session.defaultSession.cookies.get({ url: this.url, name : "access_token" });
            cooki = cooki[0].value;
             
            this.access_token = JSON.parse(decodeURIComponent(cooki)).accessToken;
            this.refresh_token = JSON.parse(decodeURIComponent(cooki)).refreshToken;
            if (!this.token_expires_at) this.token_expires_at = now + 60*5; //(tokens expire in 10 minutes)

            if (this.access_token && this.token_expires_at < now) {
                //renew auth token if expired https://us-user.bilibilicomics.com/twirp/global.v1.User/RefreshToken?device=pc&platform=web&lang=en&sys_lang=en
                const data = await this._fetchGlobalUser('/RefreshToken', {refresh_token : this.refresh_token});
                this.access_token = data.data.access_token;
                this.refresh_token = data.data.refresh_token;
                this.token_expires_at = now + 60*5;
                await require('electron').remote.session.defaultSession.cookies.set({url : this.url, name : 'access_token', value : this.access_token});
                await require('electron').remote.session.defaultSession.cookies.set({url : this.url, name : 'refresh_token', value : this.refresh_token});
                return;
            }

        } catch(error) {
            this.access_token = undefined;
            this.refresh_token = undefined;
            this.token_expires_at = undefined;

        }

    }

    async _fetchTwirp(path, body) {
        await this.getToken();
        const uri = new URL('/twirp/comic.v1.Comic' + path, this.url);
        uri.searchParams.set('device', 'pc');
        uri.searchParams.set('platform', 'web');
        uri.searchParams.set('lang', this.lang);
        uri.searchParams.set('sys_lang', this.lang);
        let request = new Request(uri, {
            method: 'POST',
            body: JSON.stringify(body),
            headers: {
                'x-origin': this.url,
                'Content-Type': 'application/json;charset=UTF-8',
                'x-referer':  uri,
            }
        });
        if (this.access_token) request.headers.set('Authorization', ' Bearer '+ this.access_token);
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

        //Using access_token from cookies, try to get token for unlocked chapter
        if (this.access_token) {
            credz = await this._fetchGlobalUser('/GetCredential', {
                ep_id: chapter.id,
                comic_id : chapter.manga.id,
                type : 1
            });
        }
        //if we got chapter credentials, fetch full chapter using it
        if (credz.data && credz.data.credential) {
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

        let images = data.images.map(image => image.path + '@' + image.x + 'w.' + this.config.quality.value);
        images = await this._fetchTwirp('/ImageToken', {
            urls: JSON.stringify(images)
        });
        return images.map(image => image.url + '?token=' + image.token);
    }

    async _fetchGlobalUser(path, body) {
        const uri = new URL('/twirp/global.v1.User' + path, 'https://us-user.bilibilicomics.com');
        uri.searchParams.set('device', 'pc');
        uri.searchParams.set('platform', 'web');
        uri.searchParams.set('lang', this.lang);
        uri.searchParams.set('sys_lang', this.lang);
        let request = new Request(uri, {
            method: 'POST',
            body: JSON.stringify(body),
            headers: {
                'x-origin': this.url,
                'Content-Type': 'application/json;charset=utf-8',
                'x-referer': 'https://us-user.bilibilicomics.com/',
                'x-sec-fetch-site': 'same-site',
                'Accept-Language': 'en-US,en;q=0.5',
                'Authorization' : ' Bearer '+ this.access_token
            }
        });
        return await this.fetchJSON(request);
    }

}
