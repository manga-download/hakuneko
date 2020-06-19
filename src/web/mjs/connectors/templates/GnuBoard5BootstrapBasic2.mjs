import Connector from '../../engine/Connector.mjs';
import Manga from '../../engine/Manga.mjs';

class TwitterAPI {

    constructor() {
        this._authorization = 'Bearer AAAAAAAAAAAAAAAAAAAAANRILgAAAAAAnNwIzUejRCOuH5E6I8xnZz4puTs%3D1Zv7ttfk8LF81IUq16cHjhLTvJu4FA33AGWWjCpTnA';
    }

    async _getGuestToken() {
        let response = await fetch('https://api.twitter.com/1.1/guest/activate.json', {
            method: 'POST',
            headers: {
                'authorization': this._authorization
            }
        });
        let data = await response.json();
        return data.guest_token;
    }

    async _getProfileData(userID) {
        let response = await fetch(`https://api.twitter.com/2/timeline/profile/${userID}.json`, {
            method: 'GET',
            headers: {
                'authorization': this._authorization,
                'x-guest-token': await this._getGuestToken()
            }
        });
        let data = await response.json();
        return data;
    }

    async getProfileURL(userID) {
        try {
            let data = await this._getProfileData(userID);

            // find references in user info
            let userRef = data.globalObjects.users[userID].entities.url;
            if(userRef && userRef.urls.length) {
                return new URL(userRef.urls[0].expanded_url).origin;
            }

            // find references in user tweets
            let tweets = Object.keys(data.globalObjects.tweets)
                .map(key => data.globalObjects.tweets[key])
                .sort((a, b) => a.id_str < b.id_str ? 1 : -1);
            for(let tweet of tweets) {
                if(tweet.entities.urls && tweet.entities.urls.length) {
                    return new URL(tweet.entities.urls[0].expanded_url).origin;
                }
            }
        } catch(error) {
            console.warn('Failed to retrieve data from Twitter API!', error);
        }

        return undefined;
    }
}

export default class GnuBoard5BootstrapBasic2 extends Connector {

    constructor() {
        super();
        super.id = undefined;
        super.label = undefined;
        this.tags = [];
        this.url = undefined;

        this.path = [ '/웹툰/연재?fil=제목', '/웹툰/완결?fil=제목' ];
        this.queryManga = 'meta[property="og:title"]';
        this.queryMangas = 'div#wt_list .section-item div.section-item-title > a';
        this.queryChapters = 'div#bo_list table.web_list tbody tr td.content__title';
        this.scriptPages = `
            new Promise(resolve => {
                resolve([...document.querySelectorAll('div#toon_img img')].map(img => img.src));
            });
        `;

        this._twitter = new TwitterAPI();
    }

    async _getMangaFromURI(uri) {
        let request = new Request(uri, this.requestOptions);
        let data = await this.fetchDOM(request, this.queryManga);
        let id = uri.pathname + uri.search;
        let title = data[0].content.trim();
        return new Manga(this, id, title);
    }

    async _getMangasFromPage(page) {
        let request = new Request(new URL(page, this.url), this.requestOptions);
        let data = await this.fetchDOM(request, this.queryMangas);
        return data.map(element => {
            return {
                id: this.getRootRelativeOrAbsoluteLink(element, this.url),
                title: element.text.trim()
            };
        });
    }

    async _getMangas() {
        let mangaList = [];
        for(let page of this.path) {
            let mangas = await this._getMangasFromPage(page);
            mangaList.push(...mangas);
        }
        return mangaList;
    }

    async _getChapters(manga) {
        let request = new Request(new URL(manga.id, this.url), this.requestOptions);
        let data = await this.fetchDOM(request, this.queryChapters);
        return data.map(element => {
            return {
                id: this.getRootRelativeOrAbsoluteLink(element.dataset.role, this.url),
                title: element.textContent.replace(manga.title, '').trim(),
                language: ''
            };
        });
    }

    async _getPages(chapter) {
        let request = new Request(new URL(chapter.id, this.url), this.requestOptions);
        return Engine.Request.fetchUI(request, this.scriptPages);
    }
}