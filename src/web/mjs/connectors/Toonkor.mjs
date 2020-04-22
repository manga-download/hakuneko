import Connector from '../engine/Connector.mjs';
import Manga from '../engine/Manga.mjs';

export default class Toonkor extends Connector {

    constructor() {
        super();
        super.id = 'toonkor';
        super.label = 'Toonkor';
        this.tags = [ 'webtoon', 'korean' ];
        this.url = 'https://tkor.ltd';
    }

    async _initializeConnector() {
        // determine current domain ...

        // curl 'https://api.twitter.com/2/timeline/profile/1202224761771741184.json?include_profile_interstitial_type=1&include_blocking=1&include_blocked_by=1&include_followed_by=1&include_want_retweets=1&include_mute_edge=1&include_can_dm=1&include_can_media_tag=1&skip_status=1&cards_platform=Web-12&include_cards=1&include_composer_source=true&include_ext_alt_text=true&include_reply_count=1&tweet_mode=extended&include_entities=true&include_user_entities=true&include_ext_media_color=true&include_ext_media_availability=true&send_error_codes=true&simple_quoted_tweets=true&include_tweet_replies=false&userId=1202224761771741184&count=20&cursor=HBaAwKLBr76V0SIAAA%3D%3D&ext=mediaStats%2ChighlightedLabel%2CcameraMoment' -H 'authority: api.twitter.com' -H 'x-twitter-client-language: en' -H 'x-csrf-token: e4925b2dcf85b7c35ac34ce029d9513e' -H 'authorization: Bearer AAAAAAAAAAAAAAAAAAAAANRILgAAAAAAnNwIzUejRCOuH5E6I8xnZz4puTs%3D1Zv7ttfk8LF81IUq16cHjhLTvJu4FA33AGWWjCpTnA' -H 'user-agent: Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_3) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/80.0.3987.163 Safari/537.36' -H 'sec-fetch-dest: empty' -H 'x-guest-token: 1252524041304506369' -H 'x-twitter-active-user: yes' -H 'accept: */*' -H 'origin: https://twitter.com' -H 'sec-fetch-site: same-site' -H 'sec-fetch-mode: cors' -H 'referer: https://twitter.com/new_toonkor' -H 'accept-language: en-US,en;q=0.9,de;q=0.8' -H 'cookie: personalization_id="v1_iSOrr/c3GMgeAN/R0mRkJg=="; guest_id=v1%3A158379559659381723; _twitter_sess=BAh7CSIKZmxhc2hJQzonQWN0aW9uQ29udHJvbGxlcjo6Rmxhc2g6OkZsYXNo%250ASGFzaHsABjoKQHVzZWR7ADoPY3JlYXRlZF9hdGwrCJryksFwAToMY3NyZl9p%250AZCIlYzBlOGVkM2U3YTI1ZDNkNmU3Zjg1N2Q0ODUwODFjOTQ6B2lkIiU1MTRj%250AMDAzNWRlOTA3ZDI4ODZhNzBjYWRjMGRmYjRkOA%253D%253D--d837b2e8547fd4134130b505178aed920574fcd5; eu_cn=1; syndication_guest_id=v1%3A158474925720711474; tfw_exp=0; gt=1252524041304506369; ct0=e4925b2dcf85b7c35ac34ce029d9513e; external_referer=padhuUp37zjgzgv1mFWxJ12Ozwit7owX|0|8e8t2xd8A2w%3D' --compressed
        // curl 'https://api.twitter.com/2/timeline/profile/1202224761771741184.json?' -H 'authorization: Bearer AAAAAAAAAAAAAAAAAAAAANRILgAAAAAAnNwIzUejRCOuH5E6I8xnZz4puTs%3D1Zv7ttfk8LF81IUq16cHjhLTvJu4FA33AGWWjCpTnA' -H 'x-guest-token: 1252524041304506369' -H 'x-twitter-active-user: yes'

        // this.url = data.globalObjects.users.1202224761771741184.entities.url.urls[0].expanded_url

        let uri = new URL(this.url);
        uri.searchParams.set('ts', Date.now());
        uri.searchParams.set('rd', Math.random());
        let request = new Request(uri.href, this.requestOptions);
        return Engine.Request.fetchUI(request, '');
    }

    async _getMangaFromURI(uri) {
        let request = new Request(uri, this.requestOptions);
        let data = await this.fetchDOM(request, 'meta[property="og:title"]');
        let id = uri.pathname + uri.search;
        let title = data[0].content.trim();
        return new Manga(this, id, title);
    }

    async _getMangasFromPage(page) {
        let request = new Request(new URL(page + '?fil=제목', this.url), this.requestOptions);
        let data = await this.fetchDOM(request, 'div#wt_list .section-item div.section-item-title a#title');
        return data.map( element => {
            return {
                id: this.getRootRelativeOrAbsoluteLink( element, request.url ),
                title: element.text.trim()
            };
        });
    }

    async _getMangas() {
        let mangaList = [];
        for(let page of [ '/웹툰/연재', '/웹툰/완결' ]) {
            let mangas = await this._getMangasFromPage(page);
            mangaList.push(...mangas);
        }
        return mangaList;
    }

    async _getChapters(manga) {
        let request = new Request(new URL(manga.id, this.url), this.requestOptions);
        let data = await this.fetchDOM(request, 'div#bo_list table.web_list tbody tr td.content__title');
        return data.map(element => {
            return {
                id: this.getRootRelativeOrAbsoluteLink(element.dataset.role, request.url),
                title: element.textContent.replace(manga.title, '').trim(),
                language: ''
            };
        });
    }

    async _getPages(chapter) {
        let script = `
            new Promise(resolve => {
                resolve([...document.querySelectorAll('div#toon_img img')].map(img => img.src));
            });
        `;
        let request = new Request(new URL(chapter.id, this.url), this.requestOptions);
        return Engine.Request.fetchUI(request, script);
    }
}