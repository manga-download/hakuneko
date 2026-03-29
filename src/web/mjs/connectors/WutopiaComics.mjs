import Connector from '../engine/Connector.mjs';
import Manga from '../engine/Manga.mjs';

export default class WutopiaComics extends Connector {

    constructor() {
        super();
        super.id = 'wutopiacomics';
        super.label = 'Wutopia';
        this.tags = [ 'webtoon', 'english' ];
        this.url = 'https://www.wutopiacomics.com';

        this.config = {
            username: {
                label: 'E-Mail',
                description: 'E-Mail for login with your Wutopia account.',
                input: 'text',
                value: ''
            },
            password: {
                label: 'Password',
                description: 'Password for login with your Wutopia account.',
                input: 'password',
                value: ''
            }
        };

        this.user = {
            id: null,
            sysToken: null
        };
    }

    async _login() {
        const user = this.config.username.value;
        const pass = this.config.password.value;
        if(user && pass) {
            const data = await this._fetchPOST('/mobile/index/login', {
                account: user,
                password: pass
            });
            if(data.success && data.user) {
                this.user.id = data.user.id;
                this.user.sysToken = data.user.sysToken;
            } else {
                this._logout();
            }
        } else {
            this._logout();
        }
    }

    _logout() {
        this.user = {
            id: null,
            sysToken: null
        };
    }

    async _fetchPOST(path, body) {
        const headers = {
            'Content-Type': 'application/x-www-form-urlencoded',
            'platform': '10'
        };
        if(this.user.id && this.user.sysToken) {
            headers['userid'] = this.user.id;
            headers['token'] = this.user.sysToken;
        }
        let request = new Request(new URL(path, this.url), {
            method: 'POST',
            body: new URLSearchParams(body).toString(),
            headers: headers
        });
        return this.fetchJSON(request);
    }

    async _getMangaFromURI(uri) {
        let id = parseInt(uri.hash.match(/\d+$/)[0]);
        let data = await this._fetchPOST('/mobile/cartoon-collection/get', {
            id: id
        });
        return new Manga(this, id, data.cartoon.name.trim());
    }

    async _getMangas() {
        let data = await this._fetchPOST('/mobile/cartoon-collection/search-fuzzy', {
            pageSize: 99999,
            pageNo: 1
        });
        return data.list.map(item => {
            return {
                id: item.id,
                title: item.name.trim()
            };
        });
    }

    async _getChapters(manga) {
        let data = await this._fetchPOST('/mobile/cartoon-collection/list-chapter', {
            id: manga.id,
            pageSize: 99999,
            pageNo: 1,
            sort: 0
        });
        return data.list.map(item => {
            return {
                id: item.id,
                title: 'Chapter ' + item.chapterIndex,
                language: ''
            };
        });
    }

    async _getPages(chapter) {
        await this._login();
        let data = await this._fetchPOST('/mobile/chapter/get', {
            id: chapter.id
        });
        if(data.payState) {
            return data.chapter.picList.map(item => item.picUrl.split('@').shift());
        } else {
            throw new Error('Chapter is locked and requires to be logged in and purchased!');
        }
    }
}