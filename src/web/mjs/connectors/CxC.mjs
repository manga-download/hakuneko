import Connector from '../engine/Connector.mjs';
import Manga from '../engine/Manga.mjs';

export default class CxC extends Connector {

    constructor() {
        super();
        super.id = 'cxc';
        super.label = 'CxC - Content x Creator';
        this.tags = [ 'webtoon', 'chinese' ];
        this.url = 'https://cxc.today';
        this.api = 'https://api.cxc.today';
        this.booksPerPage = 50;
        this.uuid = null;
        this.auth = {
            accessToken: null,
            refreshToken: null,
            expireTime: null
        };
        this.requestOptions.headers.set('accept', 'application/json, text/plain, */*');
        this.requestOptions.headers.set('content-type', 'application/json;charset=utf-8');
        this.requestOptions.headers.set('referer', this.url);
        this.requestOptions.headers.set('origin', this.url + '/');
        this.requestOptions.headers.set('device', 'web');
        this.links = {
            login: 'https://cxc.today/login'
        };
        this.config = {
            username: {
                label: 'E-Mail',
                description: 'E-Mail for login with your CxC account.\nAn account is required to access 18+ content (18禁).\nA fan subscription is required to access VIP content (訂閱粉絲限定).',
                input: 'text',
                value: ''
            },
            password: {
                label: 'Password',
                description: 'Password for login with your CxC account.\nAn account is required to access 18+ content (18禁).\nA fan subscription is required to access VIP content (訂閱粉絲限定).',
                input: 'password',
                value: ''
            }
        };
    }

    async _initializeConnector() {
        await this._getUUID();
        await this._login();
    }

    async _getMangaFromURI(uri) {
        await this._login();
        const bookAddress = uri.href;
        const storeName = bookAddress.match(/\/store\/([a-zA-Z0-9_]+)\//)[1];
        const bookId = bookAddress.match(/\/book\/(\d+)/)[1];
        let storeRequest = new Request(`${this.api}/store/${storeName}?v=2`, this.requestOptions);
        let storeData = await this.fetchJSON(storeRequest);
        const id = `/store/${storeData.data.id}/book/${bookId}`;
        let bookRequest = new Request(this.api + id, this.requestOptions);
        let bookData = await this.fetchJSON(bookRequest);
        if (bookData.data.work_category.id != 1) {
            throw Error('CxC book type must be comic (漫畫).');
        }
        return new Manga(this, id, bookData.data.name);
    }

    async _getMangasFromPage(page) {
        await this._login();
        try {
            let request = new Request(`${this.api}/book?page=${page}&per_page=${this.booksPerPage}&sort_by=updated_at&work_category=1&lang=&word_count=0`, this.requestOptions);
            let bookData = await this.fetchJSON(request);
            bookData = bookData.data.data.filter(book => book.work_category.id == 1);
            return bookData.map(book => {
                return {
                    id: `/store/${book.store.id}/book/${book.id}`,
                    title: book.name
                };
            });
        } catch (error) {
            return [];
        }
    }

    async _getMangas() {
        await this._login();
        let books = [];
        for (let page = 1, run = true; run; page++) {
            const booksFromPage = await this._getMangasFromPage(page);
            booksFromPage.length > 0 ? books.push(...booksFromPage) : run = false;
        }
        return books;
    }

    async _getChapters(manga) {
        await this._login();
        let request = new Request(`${this.api}${manga.id}/chapter`, this.requestOptions);
        let chapterData;
        try {
            chapterData = await this.fetchJSON(request);
        } catch (error) {
            if (!this.auth.accessToken) {
                throw Error("Could not get chapters, may be age-restricted (18禁). Add an account to view chapters.");
            } else {
                throw Error("Could not get chapters, your account may not be configured to view age-restricted works (18禁).");
            }
        }
        return chapterData.data.data.map((chapter, index) => {
            const chapterNum = index + 1;
            return {
                id: `${manga.id}/chapter/${chapter.id}`,
                title: `#${chapterNum.toString()} - ${chapter.name}`
            };
        });
    }

    async _getPages(chapter) {
        await this._login();
        let request = new Request(`${this.api}${chapter.id}`, this.requestOptions);
        let contentData;
        try {
            contentData = await this.fetchJSON(request);
        } catch (error) {
            throw Error("Could not get pages, chapter may require a fan subscription (粉絲免費).");
        }
        return contentData.data.content.map((page) => {
            return this.createConnectorURI({
                url: page.url,
                imageKey: page.key
            });
        });
    }

    async _handleConnectorURI(payload) {
        let response = await fetch(payload.url);
        let encryptedImage = await response.arrayBuffer();
        // from app.*.js 'getImgEncrypted'
        let encTransformImage = btoa(
            [].reduce.call(
                new Uint8Array(encryptedImage),
                function (e, _) {
                    return e + String.fromCharCode(_);
                },
                ''
            )
        );
        const token = this.auth.accessToken ? this.auth.accessToken : 'freeforcxc2021reading'; //default free content token, may change in the future
        const tokenHash = CryptoJS.SHA512(token).toString();
        const tokenCombo = {
            key: tokenHash.substr(0, 64),
            iv: tokenHash.substr(30, 32)
        };
        let imageComboString = this._decrypt(payload.imageKey, tokenCombo).split(':');
        const imageCombo = {
            key: imageComboString[0],
            iv: imageComboString[1]
        };
        let decryptedImageResponse = this._decrypt(encTransformImage, imageCombo).split(",");
        // from https://cxc.today/worker/base64ToBlob.js
        const e = decryptedImageResponse[0].indexOf("base64") >= 0 ? atob(decryptedImageResponse[1]) : decodeURI(decryptedImageResponse[1]);
        let n = new Uint8Array(e.length);
        for (let i = 0; i < e.length; i++) {
            n[i] = e.charCodeAt(i);
        }
        let data = {
            mimeType: response.headers.get('content-type'),
            data: n
        };
        this._applyRealMime(data);
        return data;
    }

    _decrypt(encryptedBuffer, keyIvCombo) {
        // from https://cxc.today/worker/AESDecrypt.js
        let decryptedBuffer = CryptoJS.AES.decrypt(encryptedBuffer, CryptoJS.enc.Hex.parse(keyIvCombo.key), {
            iv: CryptoJS.enc.Hex.parse(keyIvCombo.iv),
            mode: CryptoJS.mode.CBC,
            padding: CryptoJS.pad.Pkcs7
        });
        return decryptedBuffer.toString(CryptoJS.enc.Utf8);
    }

    async _getUUID() {
        this.uuid = await this._getStorageValue('uuid');
        if (!this.uuid) {
            let request = new Request(`${this.api}/guest`, this.requestOptions);
            let data = await this.fetchJSON(request);
            this.uuid = data.data;
        }
        this.requestOptions.headers.set('uuid', this.uuid);
        return;
    }

    async _login() {
        if (this.config.username.value && this.config.password.value && !this.auth.accessToken) {
            this.auth.accessToken = await this._getStorageValue('accessToken');
            this.auth.refreshToken = await this._getStorageValue('refreshToken');
            if (!this.auth.accessToken) {
                try {
                    let loginRequest = new Request(`${this.api}/auth/login`, {
                        credentials: 'omit',
                        method: 'POST',
                        body: JSON.stringify({
                            grant_type: 'password',
                            password: this.config.password.value,
                            username: this.config.username.value
                        }),
                        headers: this.requestOptions.headers
                    });
                    let tokenData = await this.fetchJSON(loginRequest);
                    this.auth.accessToken = tokenData.access_token;
                    this.auth.refreshToken = tokenData.refresh_token;
                    const now = Math.floor(Date.now() / 1000);
                    this.auth.expireTime = now + tokenData.expires_in;
                } catch (error) {
                    throw Error('Failed to login with provided credentials.');
                }
            }
        }
        this._refreshAccessToken();
    }

    async _refreshAccessToken() {
        const now = Math.floor(Date.now() / 1000);
        if (this.auth.accessToken && now > this.auth.expireTime) {
            try {
                let refreshRequest = new Request(`${this.api}/auth/refresh_token`, {
                    credentials: 'omit',
                    method: 'POST',
                    body: JSON.stringify({
                        grant_type: 'refresh_token',
                        refresh_token: this.auth.refreshToken
                    }),
                    headers: this.requestOptions.headers
                });
                let refreshData = await this.fetchJSON(refreshRequest);
                this.auth.accessToken = refreshData.access_token;
                this.auth.refreshToken = refreshData.refresh_token;
                this.auth.expireTime = now + refreshData.expires_in;
            } catch (error) {
                this.auth.accessToken = null;
                this.auth.refreshToken = null;
                throw Error("Failed to refresh access token.");
            }
        }
        if (this.auth.accessToken) {
            this.requestOptions.headers.set('Authorization', `Bearer ${this.auth.accessToken}`);
        }
    }

    async _getStorageValue(key) {
        let request = new Request(this.api, this.requestOptions);
        return await Engine.Request.fetchUI(request, `localStorage.getItem("${key}") || ""`);
    }
}