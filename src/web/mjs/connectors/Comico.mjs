import Connector from '../engine/Connector.mjs';
import Manga from '../engine/Manga.mjs';

export default class Comico extends Connector {

    constructor() {
        super();
        super.id = 'comico';
        super.label = 'Comico (コミコ)';
        this.tags = [ 'webtoon', 'japanese' ];
        this.url = 'https://www.comico.jp';
        this.api = 'https://api.comico.jp';
        this.links = {
            login: 'https://www.comico.jp/login'
        };
    }

    async _fetchPOST(path) {
        const webkey = '9241d2f090d01716feac20ae08ba791a';
        const ip = '0.0.0.0';
        const tm = Math.round(new Date().getTime() / 1000);
        const checksum = CryptoJS.SHA256(webkey + ip + tm).toString();
        let uri = new URL(path, this.api);
        let request = new Request(uri, {
            method: 'GET',
            headers: {
                'x-referer': this.url,
                'x-origin': this.url,
                'accept' : 'application/json, text/plain, */*',
                'Accept-Language': 'ja-JP',
                'X-comico-client-os': 'other',
                'X-comico-client-store': 'other',
                'X-comico-request-time': tm,
                'X-comico-check-sum': checksum,
                'X-comico-timezone-id': 'Europe/Paris',
                'X-comico-client-immutable-uid': '0.0.0.0',
                'X-comico-client-platform': 'web',
                'X-comico-client-accept-mature': 'Y',
            }
        });
        let response = await fetch(request);
        return response.json();
    }

    async _getMangaFromURI(uri) {
        let id = uri.pathname;
        const data = await this._fetchPOST(id);
        let title = data.data.volume.content != null ? data.data.volume.content.name : data.data.episode.content.name;
        return new Manga(this, id, title);
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
        let data = await this._fetchPOST('/all_comic/new_release?pageNo='+page +'&pageSize=50');
        return !data.result ? [] : data.data.contents.map(manga => {
            return {
                id: '/'+manga.type+'/'+manga.id,
                title: manga.name
            };
        });
    }

    async _getChapters(manga) {
        const data = await this._fetchPOST(manga.id);
        //episode or volume?
        const element = data.data.episode.content != null ? data.data.episode.content : data.data.volume.content;
        return element.chapters
            .filter(chapter => chapter.activity.rented || chapter.activity.unlocked || chapter.salesConfig.free)
            .map(chapter => {
                return {
                    id: chapter.id,
                    title: chapter.name,
                    language: ''
                };
            });
    }

    async _getPages(chapter) {
        const data = await this._fetchPOST(chapter.manga.id+'/chapter/' +chapter.id+'/product');
        if (data.data.content.chapterFileFormat == 'epub') {
            throw Error('This chapter is an Epub :/');
        }
        return data.data.chapter.images.map(image => this.cookPictureUrl(image));
    }

    cookPictureUrl(image) {
        const AESKey = 'a7fc9dc89f2c873d79397f8a0028a4cd';
        const iv = CryptoJS.enc.Utf8.parse(CryptoJS.enc.Hex.parse(''));
        const passPhrase = CryptoJS.enc.Utf8.parse(AESKey);
        const decrypted = CryptoJS.AES.decrypt(image.url, passPhrase, {
            iv,
            mode: CryptoJS.mode.CBC
        });
        return new URL(CryptoJS.enc.Utf8.stringify(decrypted))+'?'+image.parameter;
    }
}
