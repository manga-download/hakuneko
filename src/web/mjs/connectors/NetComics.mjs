import Connector from '../engine/Connector.mjs';
import Manga from '../engine/Manga.mjs';

export default class NetComics extends Connector {

    constructor() {
        super();
        super.id = 'netcomics';
        super.label = 'NetComics';
        this.tags = ['webtoon', 'multi-lingual'];
        this.url = 'https://www.netcomics.com';
        this.api = 'https://beta-api.netcomics.com';
        this.requestOptions.headers.set('x-origin', this.url);
        this.requestOptions.headers.set('x-referer', this.url);
        this.token = undefined;
        this.config = {
            username: {
                label: 'E-Mail',
                description: 'E-Mail for login with your NetComics account.\nAn account is required to access R-rated content.',
                input: 'text',
                value: ''
            },
            password: {
                label: 'Password',
                description: 'Password for login with your NetComics account.\nAn account is required to access R-rated content.',
                input: 'password',
                value: ''
            },
            language: {
                label: 'Language Settings',
                description: 'Choose the language to use. This will affect available manga lists',
                input: 'select',
                options: [
                    { value: 'FR', name: 'French' },
                    { value: 'EN', name: 'English' },
                    { value: 'CN', name: 'Chinese' },
                    { value: 'KO', name: 'Korean' },
                    { value: 'JA', name: 'Japanese' },
                    { value: 'DE', name: 'German' },
                    { value: 'ID', name: 'Indonesian' },
                    { value: 'VI', name: 'Vietnamese' },
                    { value: 'TH', name: 'Thai' },
                ],
                value: 'EN'
            },
        };

    }

    async _initializeAccount() {

        if(this.token || !this.config.username.value || !this.config.password.value) {
            return;
        }

        const uri = new URL('/auth/login', this.api);
        const body = {
            password : this.config.password.value,
            username : this.config.username.value
        };

        try{

            const request = new Request(uri, {
                method: 'POST',
                headers: {
                    'x-referer': this.api+'/',
                    'x-origin' : this.url,
                    'platform' : 'web',
                    'site' : this.config.language.value,
                    'adult' : 'N',
                    'did': Date.now(),
                    'Content-type': 'application/json',
                    'Accept': 'application/json, text/plain, */*',
                },
                body : JSON.stringify(body)
            });

            const response = await fetch(request);
            const data = await response.json();
            this.token = data.data.token;

        } catch(error) {
            //
        }

    }

    async _getMangaFromURI(uri) {
        const slug = uri.pathname.split('/').pop();
        const url = new URL('/api/v1/title/comic/'+slug, this.api);
        const data = await this.fetchFromApi(url);
        const id = '/'+data.data.site+'/comic/'+data.data.title_id;
        return new Manga(this, id, data.data.title_name);
    }

    async _getMangas() {
        let mangaList = [];
        for (let page = 1, run = true; run; page++) {
            let mangas = await this._getMangasFromPage(page);
            mangas.length > 0 ? mangaList.push(...mangas) : run = false;
        }
        return mangaList;
    }
    async _getMangasFromPage(page) {
        const uri = new URL(`/api/v1/title/genre?no=${page}&size=18&genre=`, this.api);
        const data = await this.fetchFromApi(uri);
        return data.data.map(manga => {
            return {
                id: '/'+manga.site+'/comic/'+manga.title_id,
                title: manga.title_name
            };
        });
    }
    async _getChapters(manga) {
        const mangaid = manga.id.match(/\/comic\/([0-9]+)/)[1];
        const uri = new URL(`/api/v1/chapter/order/${mangaid}/rent`, this.api);
        const data = await this.fetchFromApi(uri);
        return data.data.map(chapter => {
            let title = 'Chapter '+ chapter.chapter_no+ ' ';
            title += chapter.chapter_name.trim();
            return {
                id : '/viewer/'+mangaid+'/'+ chapter.chapter_id,
                title: title
            };
        }).reverse();
    }

    async _getPages(chapter) {
        await this._initializeAccount();
        try{
            const mangaid = chapter.id.match(/\/viewer\/([\S]+)\//)[1];
            const chapterid = chapter.id.match(/\/([0-9]+)$/)[1];

            const url = new URL(`/api/v1/chapter/viewer/625/${mangaid}/${chapterid}?otp=`, this.api);
            const data = await this.fetchFromApi(url);

            //the fetch request should return error 500 if you dont have acces to the chapter
            //hence the use of try catch
            return data.data.images.map(image => {
                let uri = new URL(image.image_url, url);
                return uri.href;
            });
        } catch(e) {
            throw Error('You are not logged or chapter not purchased !');
        }
    }

    async fetchFromApi(url) {
        const request = new Request(url, {
            method: 'GET',
            headers: {
                'x-referer': this.api,
                'x-origin' : this.url,
                'platform' : 'web',
                'site' : this.config.language.value,
                'adult' : 'Y',
                'did': Date.now(),
            },
        });
        if (this.token) request.headers.set('token', this.token);
        return await this.fetchJSON(request);
    }
}
